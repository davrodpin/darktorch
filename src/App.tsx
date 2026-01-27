import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { TimerControls } from './components/TimerControls';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerErrorBoundary } from './components/TimerErrorBoundary';
import { useLeaderElection } from './hooks/useLeaderElection';
import { useOwlbearSDK } from './hooks/useOwlbearSDK';
import { usePlayerRole } from './hooks/usePlayerRole';
import { useTimer } from './hooks/useTimer';
import { useTimerSync } from './hooks/useTimerSync';
import contextMenuService from './services/contextMenu';
import statePersistenceService from './services/statePersistence';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#8b4513',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#1a0f08',
      paper: '#2c1810',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@keyframes pulse': {
          '0%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.6,
          },
          '100%': {
            opacity: 1,
          },
        },
      },
    },
  },
});

function App() {
  // Initialize all hooks and services
  useTimer();
  const { isReady } = useOwlbearSDK();
  const { player, isGM } = usePlayerRole();
  const { leaderState } = useLeaderElection();
  const { connectionStatus } = useTimerSync();

  useEffect(() => {
    // Initialize services when SDK is ready
    const initializeServices = async () => {
      if (!isReady) return;

      try {
        // Initialize context menu service
        await contextMenuService.initialize();
        
        // Initialize state persistence service
        await statePersistenceService.initialize();
        
        // Clean up old states
        await statePersistenceService.cleanupExpiredStates();
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, [isReady]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <TimerErrorBoundary>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100vh',
            overflowY: 'auto',
            p: 2,
            backgroundColor: 'background.default',
            width: '100%',
            maxWidth: '320px',
            mx: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Header with status info */}
          <Box sx={{ textAlign: 'center', mb: 2, width: '100%' }}>
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              🔥 Dark Torch
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Shadowdark RPG Timer
            </Typography>
            
            {/* Connection and status indicators */}
            {player && (
              <Typography variant="caption" color="text.secondary" display="block">
                {isGM ? '👑 Game Master' : '👤 Player'} • 
                {leaderState.isLeader ? ' 👑 Leader' : ' 👁️ Follower'} • 
                {connectionStatus.isConnected ? ' 🟢 Online' : ' 🔴 Offline'}
              </Typography>
            )}
          </Box>

          {/* Timer Display */}
          <TimerDisplay />

          {/* Timer Controls */}
          <TimerControls />

          {/* Footer with milestone status */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
              display="block"
            >
              Milestone 4 Complete 🚨
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Multi-user sync & leader election
            </Typography>
          </Box>
        </Box>
      </TimerErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
