import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export interface HourglassDisplayProps {
  /** Remaining / duration, clamped to 0..1 */
  progress: number;
  isRunning: boolean;
  isLowTime: boolean;
  isCriticalTime: boolean;
  isCompleted: boolean;
}

export const HourglassDisplay: React.FC<HourglassDisplayProps> = ({
  progress,
  isRunning,
  isLowTime,
  isCriticalTime,
  isCompleted,
}) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const clamped = Math.max(0, Math.min(1, progress));

  const colors = useMemo(() => {
    if (isCompleted) {
      return { sand: theme.palette.error.main, glow: 'rgba(244, 67, 54, 0.55)' };
    }
    if (isCriticalTime) {
      return { sand: theme.palette.error.light, glow: 'rgba(244, 67, 54, 0.35)' };
    }
    if (isLowTime) {
      return { sand: theme.palette.warning.main, glow: 'rgba(255, 152, 0, 0.30)' };
    }
    return { sand: theme.palette.primary.main, glow: 'rgba(255, 107, 53, 0.25)' };
  }, [isCompleted, isCriticalTime, isLowTime, theme.palette]);

  // Geometry: viewBox 0..160 x 0..220
  const topY0 = 22;
  const topY1 = 98;
  const bottomY0 = 102;
  const bottomY1 = 178;

  const topTotal = topY1 - topY0;
  const bottomTotal = bottomY1 - bottomY0;

  const topFillHeight = topTotal * clamped;
  const topFillY = topY1 - topFillHeight;

  const bottomFillHeight = bottomTotal * (1 - clamped);
  const bottomFillY = bottomY1 - bottomFillHeight;

  const transition = prefersReducedMotion ? 'none' : 'height 1s linear, y 1s linear';
  const streamOn = isRunning && !isCompleted && !prefersReducedMotion;

  return (
    <Box
      sx={{
        width: 160,
        height: 220,
        mx: 'auto',
        filter: `drop-shadow(0 0 10px ${colors.glow})`,
      }}
    >
      <svg
        width="160"
        height="220"
        viewBox="0 0 160 220"
        role="img"
        aria-label="Hourglass timer"
      >
        <style>
          {`
            @keyframes hourglassStream {
              0% { opacity: 0.25; transform: translateY(0px); }
              50% { opacity: 0.9; transform: translateY(4px); }
              100% { opacity: 0.25; transform: translateY(0px); }
            }
            @keyframes hourglassWobble {
              0% { transform: rotate(-0.6deg); }
              50% { transform: rotate(0.6deg); }
              100% { transform: rotate(-0.6deg); }
            }
          `}
        </style>

        <g style={{ transformOrigin: '80px 110px' }} transform={undefined}>
          <g
            style={
              streamOn
                ? {
                    animation: 'hourglassWobble 2.2s ease-in-out infinite',
                    transformOrigin: '80px 110px',
                  }
                : undefined
            }
          >
            {/* Outline */}
            <path
              d="M50 20 H110 L86 100 L110 180 H50 L74 100 Z"
              fill="none"
              stroke={theme.palette.text.primary}
              strokeOpacity="0.65"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M54 22 H106 L84 100 L106 178 H54 L76 100 Z"
              fill="none"
              stroke={theme.palette.text.primary}
              strokeOpacity="0.15"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Clips */}
            <defs>
              <clipPath id="hgTop">
                <polygon points="54,22 106,22 80,98" />
              </clipPath>
              <clipPath id="hgBottom">
                <polygon points="80,102 54,178 106,178" />
              </clipPath>
            </defs>

            {/* Sand: top */}
            <rect
              x="54"
              y={topFillY}
              width="52"
              height={topFillHeight}
              fill={colors.sand}
              clipPath="url(#hgTop)"
              style={{ transition }}
              opacity={isCompleted ? 0.35 : 0.95}
            />

            {/* Sand: bottom */}
            <rect
              x="54"
              y={bottomFillY}
              width="52"
              height={bottomFillHeight}
              fill={colors.sand}
              clipPath="url(#hgBottom)"
              style={{ transition }}
              opacity={isCompleted ? 0.35 : 0.95}
            />

            {/* Stream */}
            {!isCompleted && (
              <rect
                x="78.5"
                y="100"
                width="3"
                height="20"
                rx="1.5"
                fill={colors.sand}
                opacity={streamOn ? 1 : 0.25}
                style={
                  streamOn
                    ? {
                        animation: 'hourglassStream 0.9s ease-in-out infinite',
                        transformOrigin: '80px 110px',
                      }
                    : undefined
                }
              />
            )}
          </g>
        </g>
      </svg>
    </Box>
  );
};

