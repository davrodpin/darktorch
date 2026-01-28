import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import OBR from '@owlbear-rodeo/sdk';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class TimerErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to console for development
    console.error('Timer Error Boundary caught an error:', error, errorInfo);

    // Report error
    this.reportError(error, errorInfo);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.retryCount,
      };

      // Try to report via Owlbear Rodeo SDK if available
      if (typeof OBR !== 'undefined') {
        try {
          await OBR.broadcast.sendMessage(
            'com.github.davrodpin.darktorch/error-report',
            errorReport
          );
        } catch (broadcastError) {
          console.warn('Failed to broadcast error report:', broadcastError);
        }
      }

      // Also store locally for debugging
      const storedErrors = JSON.parse(
        localStorage.getItem('darktorch-error-reports') || '[]'
      );
      storedErrors.push(errorReport);

      // Keep only last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.shift();
      }

      localStorage.setItem(
        'darktorch-error-reports',
        JSON.stringify(storedErrors)
      );
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  private handleRetry = () => {
    if (this.retryCount >= this.maxRetries) {
      // Force reload if too many retries
      window.location.reload();
      return;
    }

    this.retryCount++;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private getErrorSeverity = (): 'error' | 'warning' => {
    if (!this.state.error) return 'error';

    // Categorize errors based on message content
    const message = this.state.error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      return 'warning';
    }

    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'warning';
    }

    return 'error';
  };

  private getErrorSuggestion = (): string => {
    if (!this.state.error) return '';

    const message = this.state.error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      return 'Check your internet connection and try again.';
    }

    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'Only the Game Master can perform this action. Contact your GM if you need timer control.';
    }

    if (message.includes('timeout')) {
      return 'The operation timed out. Please try again.';
    }

    if (message.includes('broadcast') || message.includes('sync')) {
      return 'Timer synchronization failed. The timer may continue working locally.';
    }

    return 'An unexpected error occurred. Try reloading the extension.';
  };

  private copyErrorToClipboard = () => {
    if (!this.state.error) return;

    const errorText = `
Dark Torch Error Report
======================
Error ID: ${this.state.errorId}
Time: ${new Date().toISOString()}
Message: ${this.state.error.message}
Stack: ${this.state.error.stack || 'No stack trace available'}
${this.state.errorInfo ? `Component Stack:\n${this.state.errorInfo.componentStack}` : ''}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard
      .writeText(errorText)
      .then(() => {
        alert('Error details copied to clipboard!');
      })
      .catch(() => {
        console.log('Failed to copy to clipboard');
      });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.getErrorSeverity();
      const suggestion = this.getErrorSuggestion();

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            p: 3,
            gap: 2,
          }}
        >
          <Alert severity={severity} icon={<ErrorIcon />} sx={{ width: '100%' }}>
            <AlertTitle>Timer Error Occurred</AlertTitle>
            {suggestion}
          </Alert>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Error ID: {this.state.errorId}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              disabled={this.retryCount >= this.maxRetries}
            >
              {this.retryCount >= this.maxRetries
                ? 'Reload Page'
                : `Retry (${this.retryCount}/${this.maxRetries})`}
            </Button>

            <Button variant="outlined" onClick={this.handleReload}>
              Reload Extension
            </Button>

            <Button
              variant="text"
              startIcon={<BugIcon />}
              onClick={this.copyErrorToClipboard}
              size="small"
            >
              Copy Error
            </Button>
          </Box>

          {this.state.error && (
            <Accordion sx={{ width: '100%', maxWidth: '500px' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="caption">Technical Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}
                >
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

// Error boundary hook for functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Error captured by useErrorBoundary:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { resetError, captureError };
};

export default TimerErrorBoundary;
export { TimerErrorBoundary };
