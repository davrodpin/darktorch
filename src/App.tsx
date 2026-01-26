import { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#8b4513',
    },
    background: {
      default: '#1a0f08',
      paper: '#2c1810',
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize Owlbear Rodeo SDK when component mounts
    const initOwlbear = async () => {
      try {
        const OBR = (await import('@owlbear-rodeo/sdk')).default;

        // Check if we're in Owlbear Rodeo environment
        if (typeof OBR !== 'undefined') {
          console.log('Dark Torch initialized in Owlbear Rodeo');
          // TODO: Set up context menu and other SDK features in future milestones
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
          justifyContent: 'center',
          minHeight: '100vh',
          p: 2,
          backgroundColor: 'background.default',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          🔥 Dark Torch
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary">
          Real-time torch timer for Shadowdark RPG
        </Typography>
        <Typography variant="caption" textAlign="center" sx={{ mt: 2 }}>
          Extension skeleton loaded - Ready for Milestone 2
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
