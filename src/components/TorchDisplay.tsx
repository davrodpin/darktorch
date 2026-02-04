import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useMemo } from 'react';

export interface TorchDisplayProps {
  /** Remaining / duration, clamped to 0..1 */
  progress: number;
  isRunning: boolean;
  isLowTime: boolean;
  isCriticalTime: boolean;
  isCompleted: boolean;
  /** When true and isCompleted, show pulse flash (same as number display) */
  showPulse?: boolean;
}

const VIEW_WIDTH = 120;
const VIEW_HEIGHT = 220;

// Geometry (viewBox 0..120 x 0..220)
const CENTER_X = 60;
const HANDLE_TOP = 135;
const HANDLE_BOTTOM = 200;
const HANDLE_WIDTH = 16;
const WRAP_HEIGHT = 10;

// Flame dimensions
const FLAME_BASE_Y = 135;
const FLAME_MAX_HEIGHT = 100;
const FLAME_MAX_WIDTH = 40;

const FLICKER_DURATION = '0.8s';

export const TorchDisplay: React.FC<TorchDisplayProps> = ({
  progress,
  isRunning,
  isLowTime,
  isCriticalTime,
  isCompleted,
  showPulse = false,
}) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const clamped = Math.max(0, Math.min(1, progress));

  const colors = useMemo(() => {
    if (isCompleted) {
      return { flame: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.25)' };
    }
    if (isCriticalTime) {
      return { flame: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.22)' };
    }
    if (isLowTime) {
      return { flame: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.18)' };
    }
    return { flame: theme.palette.text.primary, glow: 'rgba(0, 0, 0, 0.14)' };
  }, [isCompleted, isCriticalTime, isLowTime, theme.palette]);

  const flickerOn = isRunning && !isCompleted && !prefersReducedMotion && clamped > 0;

  // Flash animation: same markers and speed as number display (pulse / criticalTimeFade / lowTimeFade)
  const flashAnimation =
    !prefersReducedMotion &&
    (isCompleted && showPulse
      ? 'pulse 0.5s ease-in-out infinite alternate'
      : isCriticalTime
        ? 'criticalTimeFade 0.9s ease-in-out infinite'
        : isLowTime
          ? 'lowTimeFade 1.8s ease-in-out infinite'
          : 'none');

  // Flame scales with progress
  const flameHeight = FLAME_MAX_HEIGHT * clamped;
  const flameWidth = FLAME_MAX_WIDTH * Math.max(0.3, clamped); // Minimum width when nearly out
  const flameTopY = FLAME_BASE_Y - flameHeight;

  // Build flame path - teardrop shape using bezier curves
  const flamePath = clamped > 0
    ? `M ${CENTER_X} ${FLAME_BASE_Y}
       C ${CENTER_X - flameWidth / 2} ${FLAME_BASE_Y - flameHeight * 0.3}
         ${CENTER_X - flameWidth / 2} ${flameTopY + flameHeight * 0.4}
         ${CENTER_X} ${flameTopY}
       C ${CENTER_X + flameWidth / 2} ${flameTopY + flameHeight * 0.4}
         ${CENTER_X + flameWidth / 2} ${FLAME_BASE_Y - flameHeight * 0.3}
         ${CENTER_X} ${FLAME_BASE_Y}
       Z`
    : null;

  // Inner flame (smaller, for depth effect)
  const innerFlameHeight = flameHeight * 0.6;
  const innerFlameWidth = flameWidth * 0.5;
  const innerFlameTopY = FLAME_BASE_Y - innerFlameHeight;
  const innerFlamePath = clamped > 0.1
    ? `M ${CENTER_X} ${FLAME_BASE_Y - 5}
       C ${CENTER_X - innerFlameWidth / 2} ${FLAME_BASE_Y - 5 - innerFlameHeight * 0.3}
         ${CENTER_X - innerFlameWidth / 2} ${innerFlameTopY + innerFlameHeight * 0.4}
         ${CENTER_X} ${innerFlameTopY}
       C ${CENTER_X + innerFlameWidth / 2} ${innerFlameTopY + innerFlameHeight * 0.4}
         ${CENTER_X + innerFlameWidth / 2} ${FLAME_BASE_Y - 5 - innerFlameHeight * 0.3}
         ${CENTER_X} ${FLAME_BASE_Y - 5}
       Z`
    : null;

  return (
    <Box
      sx={{
        width: VIEW_WIDTH,
        height: VIEW_HEIGHT,
        mx: 'auto',
        position: 'relative',
        filter: `drop-shadow(0 2px 8px ${colors.glow})`,
        ...(flashAnimation && flashAnimation !== 'none' ? { animation: flashAnimation } : {}),
      }}
    >
      <svg
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Torch timer"
        style={{ display: 'block' }}
      >
        <style>
          {`
            @keyframes torchFlicker {
              0% { transform: scaleX(1) scaleY(1); }
              25% { transform: scaleX(0.95) scaleY(1.02); }
              50% { transform: scaleX(1.05) scaleY(0.98); }
              75% { transform: scaleX(0.97) scaleY(1.01); }
              100% { transform: scaleX(1) scaleY(1); }
            }
            @keyframes innerFlicker {
              0% { transform: scaleX(1) scaleY(1); opacity: 0.7; }
              33% { transform: scaleX(1.1) scaleY(0.95); opacity: 0.5; }
              66% { transform: scaleX(0.9) scaleY(1.05); opacity: 0.8; }
              100% { transform: scaleX(1) scaleY(1); opacity: 0.7; }
            }
          `}
        </style>

        {/* Torch handle */}
        <rect
          x={CENTER_X - HANDLE_WIDTH / 2}
          y={HANDLE_TOP}
          width={HANDLE_WIDTH}
          height={HANDLE_BOTTOM - HANDLE_TOP}
          fill={theme.palette.text.primary}
          rx={2}
        />

        {/* Handle wrap (top binding) */}
        <rect
          x={CENTER_X - HANDLE_WIDTH / 2 - 2}
          y={HANDLE_TOP - WRAP_HEIGHT / 2}
          width={HANDLE_WIDTH + 4}
          height={WRAP_HEIGHT}
          fill={theme.palette.text.primary}
          rx={1}
        />

        {/* Inner handle detail */}
        <rect
          x={CENTER_X - HANDLE_WIDTH / 2 + 3}
          y={HANDLE_TOP + 5}
          width={HANDLE_WIDTH - 6}
          height={HANDLE_BOTTOM - HANDLE_TOP - 10}
          fill={theme.palette.background.paper}
          fillOpacity={0.3}
          rx={1}
        />

        {/* Flame - outer */}
        {flamePath && (
          <path
            d={flamePath}
            fill={colors.flame}
            style={{
              transformOrigin: `${CENTER_X}px ${FLAME_BASE_Y}px`,
              ...(flickerOn ? { animation: `torchFlicker ${FLICKER_DURATION} ease-in-out infinite` } : {}),
            }}
          />
        )}

        {/* Flame - inner (lighter/brighter effect) */}
        {innerFlamePath && (
          <path
            d={innerFlamePath}
            fill={theme.palette.background.paper}
            fillOpacity={0.5}
            style={{
              transformOrigin: `${CENTER_X}px ${FLAME_BASE_Y}px`,
              ...(flickerOn ? { animation: `innerFlicker ${FLICKER_DURATION} ease-in-out infinite` } : {}),
            }}
          />
        )}
      </svg>
    </Box>
  );
};
