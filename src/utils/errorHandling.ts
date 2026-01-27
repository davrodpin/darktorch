import OBR from '@owlbear-rodeo/sdk';

export class TimerError extends Error {
  public code: string;
  public context: Record<string, any>;
  public timestamp: number;
  public retryable: boolean;

  constructor(
    message: string,
    code: string,
    context: Record<string, any> = {},
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'TimerError';
    this.code = code;
    this.context = context;
    this.timestamp = Date.now();
    this.retryable = retryable;
  }
}

export const ERROR_CODES = {
  // Network/Connection errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_LOST: 'CONNECTION_LOST',
  TIMEOUT: 'TIMEOUT',

  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_LEADER: 'NOT_LEADER',
  GM_REQUIRED: 'GM_REQUIRED',

  // Sync/Conflict errors
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',

  // State errors
  INVALID_STATE: 'INVALID_STATE',
  TIMER_EXPIRED: 'TIMER_EXPIRED',
  INVALID_TIME: 'INVALID_TIME',

  // Owlbear Rodeo errors
  OBR_NOT_READY: 'OBR_NOT_READY',
  OBR_SDK_ERROR: 'OBR_SDK_ERROR',
  BROADCAST_FAILED: 'BROADCAST_FAILED',

  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
} as const;

// Error creation helpers
export const createNetworkError = (
  message: string,
  context?: Record<string, any>
) => new TimerError(message, ERROR_CODES.NETWORK_ERROR, context, true);

export const createPermissionError = (
  message: string,
  context?: Record<string, any>
) => new TimerError(message, ERROR_CODES.PERMISSION_DENIED, context, false);

export const createSyncError = (
  message: string,
  context?: Record<string, any>
) => new TimerError(message, ERROR_CODES.SYNC_CONFLICT, context, true);

export const createTimeoutError = (
  message: string,
  context?: Record<string, any>
) => new TimerError(message, ERROR_CODES.TIMEOUT, context, true);

export const createOBRError = (
  message: string,
  context?: Record<string, any>
) => new TimerError(message, ERROR_CODES.OBR_SDK_ERROR, context, false);

// Error classification
export const isRetryableError = (error: Error): boolean => {
  return error instanceof TimerError ? error.retryable : false;
};

export const isNetworkError = (error: Error): boolean => {
  if (error instanceof TimerError) {
    return [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.CONNECTION_LOST,
      ERROR_CODES.TIMEOUT,
      ERROR_CODES.BROADCAST_FAILED,
    ].includes(error.code as any);
  }
  return (
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('connection')
  );
};

export const isPermissionError = (error: Error): boolean => {
  if (error instanceof TimerError) {
    return [
      ERROR_CODES.PERMISSION_DENIED,
      ERROR_CODES.NOT_LEADER,
      ERROR_CODES.GM_REQUIRED,
    ].includes(error.code as any);
  }
  return (
    error.message.toLowerCase().includes('permission') ||
    error.message.toLowerCase().includes('unauthorized')
  );
};

export const isSyncError = (error: Error): boolean => {
  if (error instanceof TimerError) {
    return [
      ERROR_CODES.SYNC_CONFLICT,
      ERROR_CODES.VERSION_MISMATCH,
      ERROR_CODES.CONCURRENT_MODIFICATION,
    ].includes(error.code as any);
  }
  return (
    error.message.toLowerCase().includes('sync') ||
    error.message.toLowerCase().includes('conflict')
  );
};

// Retry mechanism with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry non-retryable errors
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      if (attempt === maxAttempts) {
        throw new TimerError(
          `Operation failed after ${maxAttempts} attempts: ${lastError.message}`,
          ERROR_CODES.NETWORK_ERROR,
          { attempts: maxAttempts, originalError: lastError },
          false
        );
      }

      // Calculate delay with exponential backoff and jitter
      const jitter = Math.random() * 0.1 * baseDelay;
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + jitter,
        30000
      );

      console.warn(
        `Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${Math.round(delay)}ms:`,
        lastError
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Safe async operation wrapper
export const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorHandler?: (error: Error) => void
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    console.error('Async operation failed:', err);

    if (errorHandler) {
      errorHandler(err);
    }

    return fallback;
  }
};

// Error reporting utility
export const reportError = async (
  error: Error,
  context?: Record<string, any>
) => {
  try {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: context || {},
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Try to report via Owlbear Rodeo if available
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

    // Store locally
    const storedErrors = JSON.parse(
      localStorage.getItem('darktorch-error-reports') || '[]'
    );
    storedErrors.push(errorReport);

    // Keep only last 20 errors
    if (storedErrors.length > 20) {
      storedErrors.shift();
    }

    localStorage.setItem(
      'darktorch-error-reports',
      JSON.stringify(storedErrors)
    );
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
};

// Get error suggestions
export const getErrorSuggestion = (error: Error): string => {
  if (error instanceof TimerError) {
    switch (error.code) {
      case ERROR_CODES.NETWORK_ERROR:
      case ERROR_CODES.CONNECTION_LOST:
        return 'Check your internet connection and try again.';

      case ERROR_CODES.PERMISSION_DENIED:
      case ERROR_CODES.NOT_LEADER:
        return 'Only the Game Master can perform this action.';

      case ERROR_CODES.GM_REQUIRED:
        return 'This feature requires Game Master privileges.';

      case ERROR_CODES.TIMEOUT:
        return 'The operation timed out. Please try again.';

      case ERROR_CODES.SYNC_CONFLICT:
      case ERROR_CODES.VERSION_MISMATCH:
        return 'Timer synchronization conflict. The timer may continue working locally.';

      case ERROR_CODES.OBR_NOT_READY:
        return 'Owlbear Rodeo is not ready. Please refresh the extension.';

      default:
        return 'An unexpected error occurred. Try reloading the extension.';
    }
  }

  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('connection')) {
    return 'Check your internet connection and try again.';
  }

  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'Only the Game Master can perform this action.';
  }

  if (message.includes('timeout')) {
    return 'The operation timed out. Please try again.';
  }

  return 'An unexpected error occurred. Try reloading the extension.';
};
