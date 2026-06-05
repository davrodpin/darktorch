import {
  Add,
  FlashlightOff,
  FlashlightOn,
  HourglassEmpty,
  Pause,
  PlayArrow,
  Refresh,
  Remove,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { DisplayModeToggle } from './DisplayModeToggle';
import { PermissionWrapper } from './PermissionWrapper';
import { ToggleIconButton } from './ToggleIconButton';
import { TwoIconToggleGroup } from './TwoIconToggleGroup';

export interface GMControlsProps {
  // Timer actions
  onStartPause: () => void;
  onReset: () => void;
  isRunning: boolean;
  isResume: boolean;
  isDisabled: boolean;
  isLeader: boolean;
  // Visibility
  visibilityMode: 'EVERYONE' | 'GM_ONLY';
  onVisibilityChange: (mode: 'EVERYONE' | 'GM_ONLY') => void;
  // Auto-extinguish
  autoExtinguish: boolean;
  onAutoExtinguishChange: (enabled: boolean) => void;
  // Display mode
  displayMode: 'number' | 'hourglass';
  onDisplayModeChange: (mode: 'number' | 'hourglass') => void;
  // Time adjustments
  onAddTime: () => void;
  onRemoveTime: () => void;
  onIncrementSet: (seconds: number) => void;
  remaining: number;
  duration: number;
  incrementAmount: number;
}

export const GMControls: React.FC<GMControlsProps> = ({
  onStartPause,
  onReset,
  isRunning,
  isResume,
  isDisabled,
  isLeader,
  visibilityMode,
  onVisibilityChange,
  autoExtinguish,
  onAutoExtinguishChange,
  displayMode,
  onDisplayModeChange,
  onAddTime,
  onRemoveTime,
  onIncrementSet,
  remaining,
  duration,
  incrementAmount,
}) => {
  return (
    <>
      {/* Timer Actions, Display Mode, and Visibility - all on one line (GM-only, leader-applied) */}
      <PermissionWrapper requiredRole="GM">
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Start/Reset */}
          <TwoIconToggleGroup<'start' | 'reset'>
            ariaLabel="Start and reset"
            value="start"
            options={[
              {
                value: 'start',
                ariaLabel: isRunning ? 'Pause' : isResume ? 'Resume' : 'Start',
                tooltip: isRunning ? 'Pause' : isResume ? 'Resume' : 'Start',
                icon: isRunning ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />,
                disabled: !isLeader || isDisabled,
                onClick: onStartPause,
              },
              {
                value: 'reset',
                ariaLabel: 'Reset',
                tooltip: 'Reset',
                icon: <Refresh fontSize="small" />,
                disabled: !isLeader,
                onClick: onReset,
              },
            ]}
          />

          {/* Display Mode toggle - available to all players (local preference only) */}
          <DisplayModeToggle value={displayMode} onChange={onDisplayModeChange} />

          {/* Visibility Mode */}
          <ToggleIconButton<'EVERYONE' | 'GM_ONLY'>
            value={visibilityMode}
            disabled={!isLeader}
            disabledTooltip="Only the leader can change visibility mode"
            onChange={onVisibilityChange}
            states={[
              {
                value: 'EVERYONE',
                icon: <Visibility fontSize="small" />,
                tooltip: 'Show timer to everyone.',
                ariaLabel: 'Show timer to everyone',
              },
              {
                value: 'GM_ONLY',
                icon: <VisibilityOff fontSize="small" />,
                tooltip: 'Hide timer — only the GM sees it.',
                ariaLabel: 'Hide timer — GM only',
              },
            ]}
          />

          {/* Auto-Extinguish Mode */}
          <ToggleIconButton<'enabled' | 'disabled'>
            value={autoExtinguish ? 'enabled' : 'disabled'}
            disabled={!isLeader}
            disabledTooltip="Only the leader can change auto-extinguish mode"
            onChange={(val) => onAutoExtinguishChange(val === 'enabled')}
            states={[
              {
                value: 'enabled',
                icon: <FlashlightOn fontSize="small" />,
                tooltip: 'Enable auto-extinguish — lights turn off when the timer runs out.',
                ariaLabel: 'Enable auto-extinguish',
              },
              {
                value: 'disabled',
                icon: <FlashlightOff fontSize="small" />,
                tooltip: 'Disable auto-extinguish — lights stay on when the timer runs out.',
                ariaLabel: 'Disable auto-extinguish',
              },
            ]}
          />
        </Box>
      </PermissionWrapper>

      {/* Time Adjustment Controls - Only leaders can adjust time */}
      <PermissionWrapper requiredRole="GM">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'nowrap',
            width: '100%',
          }}
        >
          {/* - / hourglass / + */}
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Tooltip
              title={`Remove ${incrementAmount / 60} minute${incrementAmount / 60 !== 1 ? 's' : ''}`}
              placement="top"
            >
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  onClick={onRemoveTime}
                  disabled={remaining <= incrementAmount}
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    color: 'common.black',
                    border: 'none',
                    '&:hover': { backgroundColor: 'white' },
                    '&.Mui-disabled': { backgroundColor: 'white', color: 'grey.500' },
                  }}
                >
                  <Remove />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Skip Time" placement="top">
              <Box
                aria-label="Skip Time"
                sx={{
                  px: 1,
                  py: 0.75,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HourglassEmpty sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Box>
            </Tooltip>

            <Tooltip
              title={`Add ${incrementAmount / 60} minute${incrementAmount / 60 !== 1 ? 's' : ''}`}
              placement="top"
            >
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  onClick={onAddTime}
                  disabled={remaining >= duration}
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    color: 'common.black',
                    border: 'none',
                    '&:hover': { backgroundColor: 'white' },
                    '&.Mui-disabled': { backgroundColor: 'white', color: 'grey.500' },
                  }}
                >
                  <Add />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* 1M / 5M / 15M */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            <Button
              variant={incrementAmount === 60 ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onIncrementSet(60)} // 1 minute
              sx={{
                px: 1.25,
                minWidth: 0,
                ...(incrementAmount === 60
                  ? { backgroundColor: 'common.black', color: 'white', '&:hover': { backgroundColor: 'common.black' } }
                  : { backgroundColor: 'white', color: 'common.black', border: '1px solid', borderColor: 'common.black', '&:hover': { backgroundColor: 'white' } }),
              }}
            >
              1M
            </Button>
            <Button
              variant={incrementAmount === 300 ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onIncrementSet(300)} // 5 minutes
              sx={{
                px: 1.25,
                minWidth: 0,
                ...(incrementAmount === 300
                  ? { backgroundColor: 'common.black', color: 'white', '&:hover': { backgroundColor: 'common.black' } }
                  : { backgroundColor: 'white', color: 'common.black', border: '1px solid', borderColor: 'common.black', '&:hover': { backgroundColor: 'white' } }),
              }}
            >
              5M
            </Button>
            <Button
              variant={incrementAmount === 900 ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onIncrementSet(900)} // 15 minutes
              sx={{
                px: 1.25,
                minWidth: 0,
                ...(incrementAmount === 900
                  ? { backgroundColor: 'common.black', color: 'white', '&:hover': { backgroundColor: 'common.black' } }
                  : { backgroundColor: 'white', color: 'common.black', border: '1px solid', borderColor: 'common.black', '&:hover': { backgroundColor: 'white' } }),
              }}
            >
              15M
            </Button>
          </Box>
        </Box>
      </PermissionWrapper>
    </>
  );
};
