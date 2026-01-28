import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { TimerControls } from './components/TimerControls';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerErrorBoundary } from './components/TimerErrorBoundary';
import { useOwlbearSDK } from './hooks/useOwlbearSDK';
import { useTimer } from './hooks/useTimer';
import contextMenuService from './services/contextMenu';
import statePersistenceService from './services/statePersistence';
import { shadowdarkTheme } from './theme/shadowdarkTheme';

function App() {
  // Initialize all hooks and services
  useTimer();
  const { isReady } = useOwlbearSDK();

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
    <ThemeProvider theme={shadowdarkTheme}>
      <CssBaseline />
      <TimerErrorBoundary>
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            p: 0,
            boxSizing: 'border-box',
            bgcolor: 'common.black',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              maxHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              p: 0,
              boxSizing: 'border-box',
              borderRadius: 0,
              border: 0,
            }}
          >
            {/* Header with status info */}
            <Box
              sx={{
                backgroundColor: 'common.black',
                color: 'common.white',
                py: 1.25,
                px: 2,
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <Tooltip title="Shadowdark RPG torch timer" arrow placement="bottom">
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ cursor: 'help' }}
                >
                  <LocalFireDepartmentIcon sx={{ color: 'common.white' }} />
                  <Typography variant="h5" component="h1" sx={{ color: 'common.white' }}>
                    Dark Torch
                  </Typography>
                </Stack>
              </Tooltip>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: 2,
                pt: 1,
                pb: 0,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  minHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Middle area: center the timer display */}
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 1,
                  }}
                >
                  <TimerDisplay />
                </Box>

                {/* Bottom area: pin controls to bottom */}
                <Box
                  sx={{
                    position: 'sticky',
                    bottom: 0,
                    bgcolor: 'background.paper',
                    pb: 2,
                  }}
                >
                  <TimerControls />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </TimerErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
