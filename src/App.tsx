import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { useTimer } from './hooks/useTimer';

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
  // Initialize timer hook for countdown logic
  useTimer();

  useEffect(() => {
    // Initialize Owlbear Rodeo SDK when component mounts
    const initOwlbear = async () => {
      try {
        const OBR = (await import('@owlbear-rodeo/sdk')).default;

        // Check if we're in Owlbear Rodeo environment
        if (typeof OBR !== 'undefined') {
          console.log('Dark Torch initialized in Owlbear Rodeo');
          // TODO: Set up context menu and other SDK features in Milestone 4
        }
      } catch (error) {
        console.error('Failed to initialize Owlbear Rodeo SDK:', error);
      }
    };

    initOwlbear();
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100vh',
          p: 2,
          backgroundColor: 'background.default',
          maxWidth: '320px',
          mx: 'auto',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2, width: '100%' }}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            🔥 Dark Torch
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Shadowdark RPG Timer
          </Typography>
        </Box>

        {/* Timer Display */}
        <TimerDisplay />

        {/* Timer Controls */}
        <TimerControls />

        {/* Footer */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            Milestone 3 Complete 🚨
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
