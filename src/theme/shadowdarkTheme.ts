import { alpha, createTheme } from '@mui/material/styles';

const black = '#0a0a0a';
const white = '#ffffff';
const gray900 = '#1b1b1b';
const gray700 = '#3a3a3a';
const gray500 = '#6a6a6a';
const gray200 = '#e6e6e6';
const gray100 = '#f3f3f3';

export const shadowdarkTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: black },
    secondary: { main: gray700 },
    background: {
      default: white,
      paper: white,
    },
    text: {
      primary: black,
      secondary: gray700,
      disabled: gray500,
    },
    divider: gray200,
    action: {
      active: black,
      hover: alpha(black, 0.04),
      selected: alpha(black, 0.08),
      disabled: alpha(black, 0.26),
      disabledBackground: alpha(black, 0.06),
      focus: alpha(black, 0.12),
    },
    // keep these monochrome to avoid color reliance
    warning: { main: gray700 },
    success: { main: gray700 },
    error: { main: black },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '0.01em' },
    h2: { fontWeight: 800, letterSpacing: '0.01em' },
    h3: { fontWeight: 800, letterSpacing: '0.01em' },
    h4: { fontWeight: 800, letterSpacing: '0.01em' },
    // display/band titles (blackletter-style). Keep usage limited to banners.
    h5: {
      fontFamily: '"UnifrakturCook", "Montserrat", serif',
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
    h6: { fontWeight: 800, letterSpacing: '0.01em' },
    button: {
      textTransform: 'none',
      fontWeight: 800,
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'light',
        },
        body: {
          backgroundColor: white,
        },
        '*': {
          WebkitTapHighlightColor: 'transparent',
        },
        '::selection': {
          backgroundColor: alpha(black, 0.14),
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.001ms',
            animationIterationCount: 1,
            transitionDuration: '0.001ms',
            scrollBehavior: 'auto',
          },
        },
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.7 },
          '100%': { opacity: 1 },
        },
        '@keyframes lowTimeFade': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.35 },
          '100%': { opacity: 1 },
        },
        '@keyframes criticalTimeFade': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.2 },
          '100%': { opacity: 1 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: white,
          border: `1px solid ${gray200}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ ownerState }) => ({
          transition: 'transform 120ms ease, background-color 160ms ease, color 160ms ease',
          borderRadius: 8,
          '&:focus-visible': {
            outline: `2px solid ${black}`,
            outlineOffset: 2,
          },
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
          ...(ownerState.variant === 'contained'
            ? {
                backgroundColor: black,
                color: white,
                '&:hover': { backgroundColor: gray900 },
              }
            : undefined),
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'transform 120ms ease, background-color 160ms ease',
          '&:focus-visible': {
            outline: `2px solid ${black}`,
            outlineOffset: 2,
          },
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: gray200,
          color: black,
          '&.Mui-selected': {
            backgroundColor: black,
            borderColor: black,
            color: white,
          },
          '&.Mui-selected:hover': {
            backgroundColor: gray900,
          },
          '&:focus-visible': {
            outline: `2px solid ${black}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: gray200,
          color: black,
          backgroundColor: gray100,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: black,
          border: `1px solid ${gray700}`,
          boxShadow: 'none',
        },
        arrow: {
          color: black,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: gray700,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: black,
            boxShadow: `0 0 0 3px ${alpha(black, 0.12)}`,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: gray200,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: `1px solid ${gray200}`,
          backgroundColor: gray100,
          color: black,
        },
        icon: {
          color: black,
        },
      },
    },
  },
});

