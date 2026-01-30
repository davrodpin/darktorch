import { alpha, createTheme } from "@mui/material/styles";

const black = "#0a0a0a";
const white = "#ffffff";
const gray700 = "#3a3a3a";
const gray500 = "#6a6a6a";
const gray200 = "#e6e6e6";
const gray100 = "#f3f3f3";

export const shadowdarkTheme = createTheme({
  palette: {
    mode: "light",
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
      hoverOpacity: 0,
      selected: alpha(black, 0.08),
      selectedOpacity: 0,
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
    h1: { fontWeight: 800, letterSpacing: "0.01em" },
    h2: { fontWeight: 800, letterSpacing: "0.01em" },
    h3: { fontWeight: 800, letterSpacing: "0.01em" },
    h4: { fontWeight: 800, letterSpacing: "0.01em" },
    // display/band titles (blackletter-style). Keep usage limited to banners.
    h5: {
      fontFamily: '"UnifrakturCook", "Montserrat", serif',
      fontWeight: 700,
      letterSpacing: "0.01em",
    },
    h6: { fontWeight: 800, letterSpacing: "0.01em" },
    button: {
      textTransform: "none",
      fontWeight: 800,
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          colorScheme: "light",
        },
        body: {
          backgroundColor: white,
        },
        "*": {
          WebkitTapHighlightColor: "transparent",
        },
        "input:focus, input:focus-visible, textarea:focus, textarea:focus-visible":
          {
            outline: "none",
          },
        "::selection": {
          backgroundColor: alpha(black, 0.14),
        },
        "@media (prefers-reduced-motion: reduce)": {
          "*": {
            animationDuration: "0.001ms",
            animationIterationCount: 1,
            transitionDuration: "0.001ms",
            scrollBehavior: "auto",
          },
        },
        "@keyframes pulse": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.7 },
          "100%": { opacity: 1 },
        },
        "@keyframes lowTimeFade": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.35 },
          "100%": { opacity: 1 },
        },
        "@keyframes criticalTimeFade": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.2 },
          "100%": { opacity: 1 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: white,
          border: `1px solid ${gray200}`,
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ ownerState }) => ({
          transition:
            "transform 120ms ease, background-color 160ms ease, color 160ms ease",
          borderRadius: 8,
          "&:focus-visible": {
            outline: `2px solid ${black}`,
            outlineOffset: 2,
          },
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
          ...(ownerState.variant === "contained"
            ? {
              backgroundColor: black,
              color: white,
              "&:hover": { backgroundColor: black },
            }
            : undefined),
        }),
        contained: {
          backgroundColor: `${black} !important`,
          color: `${white} !important`,
          "&:hover": {
            backgroundColor: `${black} !important`,
          },
        },
        containedPrimary: {
          backgroundColor: `${black} !important`,
          color: `${white} !important`,
          "&:hover": {
            backgroundColor: `${black} !important`,
          },
        },
        outlined: {
          backgroundColor: `${white} !important`,
          color: `${black} !important`,
          border: `1px solid ${black} !important`,
          "&:hover": {
            backgroundColor: `${white} !important`,
            borderColor: `${black} !important`,
          },
        },
        outlinedPrimary: {
          backgroundColor: `${white} !important`,
          color: `${black} !important`,
          border: `1px solid ${black} !important`,
          "&:hover": {
            backgroundColor: `${white} !important`,
            borderColor: `${black} !important`,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: white,
          color: black,
          border: `1px solid ${black}`,
          transition: "transform 120ms ease, background-color 160ms ease",
          "&:focus-visible": {
            outline: `2px solid ${black}`,
            outlineOffset: 2,
          },
          "&:hover": {
            backgroundColor: white,
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
          "&.Mui-disabled": {
            backgroundColor: white,
            color: gray500,
            borderColor: gray200,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          backgroundColor: `${white} !important`,
          color: black,
          border: `1px solid ${black}`,
          "&:hover": {
            backgroundColor: `${white} !important`,
          },
          "&.Mui-selected": {
            backgroundColor: `${black} !important`,
            borderColor: `${black} !important`,
            color: `${white} !important`,
            "& .MuiSvgIcon-root, & svg": {
              color: "inherit",
              fill: "currentColor",
            },
          },
          "&.Mui-selected:hover": {
            backgroundColor: `${black} !important`,
          },
          "&:focus-visible": {
            outline: `2px solid ${black}`,
            outlineOffset: 2,
          },
          // Grouped toggle buttons: same black/white, no gray (wins over MUI variants)
          "&.MuiToggleButtonGroup-grouped": {
            backgroundColor: `${white} !important`,
            color: `${black} !important`,
            border: `1px solid ${black} !important`,
            "&:hover": {
              backgroundColor: `${white} !important`,
            },
            "&.Mui-selected": {
              backgroundColor: `${black} !important`,
              borderColor: `${black} !important`,
              color: `${white} !important`,
              "& .MuiSvgIcon-root, & svg": {
                color: "inherit",
                fill: "currentColor",
              },
            },
            "&.Mui-selected:hover": {
              backgroundColor: `${black} !important`,
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          border: `1px solid ${black}`,
        },
        grouped: {
          border: 0,
          "&:not(:first-of-type)": {
            borderLeft: `1px solid ${black}`,
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
          boxShadow: "none",
        },
        arrow: {
          color: black,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: gray700,
          },
          "&.Mui-focused": {
            outline: "none",
          },
          "& .MuiOutlinedInput-input:focus": {
            outline: "none",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: `${black} !important`,
            borderWidth: "2px !important",
            boxShadow: "none",
          },
          "&.Mui-focusVisible": {
            outline: "none",
          },
          "&.Mui-focusVisible .MuiOutlinedInput-notchedOutline": {
            borderColor: `${black} !important`,
            borderWidth: "2px !important",
            boxShadow: "none",
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
