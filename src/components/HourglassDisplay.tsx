import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useMemo } from 'react';

export interface HourglassDisplayProps {
  /** Remaining / duration, clamped to 0..1 */
  progress: number;
  isRunning: boolean;
  isLowTime: boolean;
  isCriticalTime: boolean;
  isCompleted: boolean;
}

const VIEW_WIDTH = 160;
const VIEW_HEIGHT = 220;

// Geometry (viewBox 0..160 x 0..220)
const TOP_Y0 = 22;
const TOP_Y1 = 98;
const BOTTOM_Y0 = 102;
const BOTTOM_Y1 = 178;
const NECK_TOP = 98;
const TOP_BULB_LEFT = 54;
const TOP_BULB_RIGHT = 106;
const CENTER_X = 80;
const BULB_WIDTH_HALF = 26;

// Concave dip for top sand surface (drains toward neck)
const CONCAVE_DIP = 8;

const ROCK_DURATION = '3s';
const ROCK_ORIGIN = `${CENTER_X}px ${VIEW_HEIGHT / 2}px`;

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
      return { sand: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.25)' };
    }
    if (isCriticalTime) {
      return { sand: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.22)' };
    }
    if (isLowTime) {
      return { sand: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.18)' };
    }
    return { sand: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.14)' };
  }, [isCompleted, isCriticalTime, isLowTime, theme.palette]);

  const rockOn = isRunning && !isCompleted && !prefersReducedMotion;

  // Top sand: sand sits at bottom of bulb (near neck); surface rises as we empty so we empty from top to bottom.
  // progress=1 => surface at top (full); progress=0 => surface at neck (empty)
  const surfaceYTop = TOP_Y0 + (TOP_Y1 - TOP_Y0) * (1 - clamped);
  const topT = (surfaceYTop - TOP_Y0) / (TOP_Y1 - TOP_Y0);
  const halfAtY = BULB_WIDTH_HALF * (1 - topT);
  const leftX = CENTER_X - halfAtY;
  const rightX = CENTER_X + halfAtY;
  // Path: from concave surface down to neck (80,98) so sand fills bottom of bulb and surface rises when emptying
  const topSandPath =
    clamped > 0
      ? `M ${leftX} ${surfaceYTop} Q ${CENTER_X} ${surfaceYTop + CONCAVE_DIP} ${rightX} ${surfaceYTop} L ${CENTER_X} ${TOP_Y1} Z`
      : null;

  // Bottom sand: convex cone (pile). progress=1 => bottom empty (peak at base); progress=0 => bottom full (peak at top)
  const pileTopY = BOTTOM_Y1 - (BOTTOM_Y1 - BOTTOM_Y0) * (1 - clamped);
  const bottomSandPoints =
    clamped < 1 ? `${CENTER_X},${pileTopY} ${TOP_BULB_LEFT},${BOTTOM_Y1} ${TOP_BULB_RIGHT},${BOTTOM_Y1}` : null;

  return (
    <Box
      sx={{
        width: VIEW_WIDTH,
        height: VIEW_HEIGHT,
        mx: 'auto',
        position: 'relative',
        filter: `drop-shadow(0 2px 8px ${colors.glow})`,
      }}
    >
      <svg
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Hourglass timer"
        style={{ display: 'block' }}
      >
        <style>
          {`
            @keyframes hourglassRock {
              0% { transform: rotate(-2deg); }
              50% { transform: rotate(2deg); }
              100% { transform: rotate(-2deg); }
            }
          `}
        </style>
        <g
          style={{
            transformOrigin: ROCK_ORIGIN,
            ...(rockOn ? { animation: `hourglassRock ${ROCK_DURATION} ease-in-out infinite` } : {}),
          }}
        >
          <defs>
            <clipPath id="hgTop">
              <polygon points={`${TOP_BULB_LEFT},${TOP_Y0} ${TOP_BULB_RIGHT},${TOP_Y0} ${CENTER_X},${TOP_Y1}`} />
            </clipPath>
            <clipPath id="hgBottom">
              <polygon points={`${CENTER_X},${BOTTOM_Y0} ${TOP_BULB_LEFT},${BOTTOM_Y1} ${TOP_BULB_RIGHT},${BOTTOM_Y1}`} />
            </clipPath>
          </defs>

          {/* Sand: solid fill (behind glass) */}
          {topSandPath != null && (
            <path d={topSandPath} fill={colors.sand} clipPath="url(#hgTop)" />
          )}
          {bottomSandPoints != null && (
            <polygon points={bottomSandPoints} fill={colors.sand} clipPath="url(#hgBottom)" />
          )}

          {/* Glass outline */}
          <path
            d={`M ${50} ${20} L ${110} ${20} L ${86} ${NECK_TOP} L ${110} ${180} L ${50} ${180} L ${74} ${NECK_TOP} Z`}
            fill="none"
            stroke={theme.palette.text.primary}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d={`M ${54} ${22} L ${106} ${22} L ${82} ${NECK_TOP} L ${106} ${178} L ${54} ${178} L ${78} ${NECK_TOP} Z`}
            fill="none"
            stroke={theme.palette.text.primary}
            strokeOpacity="0.2"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </Box>
  );
};
