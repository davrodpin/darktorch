import {
    Add,
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
  // Display mode
  displayMode: 'number' | 'hourglass';
  onDisplayModeChange: (mode: 'number' | 'hourglass') => void;
  // Time adjustments
  onAddTime: () => void;
  onRemoveTime: () => void;
  onIncrementSet: (seconds: number) => void;
  remaining: number;
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
  displayMode,
  onDisplayModeChange,
  onAddTime,
  onRemoveTime,
  onIncrementSet,
  remaining,
  incrementAmount,
}) => {
  return (
    <>
      {/* Timer Actions, Display Mode, and Visibility - all on one line (GM-only, leader-applied) */}
      <PermissionWrapper requiredRole="GM">
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
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
          <Tooltip
            title={
              isLeader
                ? 'Visibility mode'
                : 'Only the leader can change visibility mode'
            }
            disableHoverListener={isLeader}
            disableFocusListener={isLeader}
            disableTouchListener={isLeader}
          >
            <span style={{ display: 'inline-flex' }}>
              <TwoIconToggleGroup<'EVERYONE' | 'GM_ONLY'>
                ariaLabel="Visibility mode"
                value={visibilityMode}
                disabled={!isLeader}
                onChange={onVisibilityChange}
                options={[
                  {
                    value: 'EVERYONE',
                    ariaLabel: 'Everyone can see',
                    tooltip: 'Everyone can see the timer.',
                    icon: <Visibility fontSize="small" />,
                  },
                  {
                    value: 'GM_ONLY',
                    ariaLabel: 'GM only can see',
                    tooltip:
                      'Only the GM can see the timer. Players see a hidden placeholder.',
                    icon: <VisibilityOff fontSize="small" />,
                  },
                ]}
              />
            </span>
          </Tooltip>
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
                  color="primary"
                  size="small"
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
                  borderColor: 'grey.200',
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
                  disabled={remaining >= 3600} // Don't exceed 1 hour
                  color="primary"
                  size="small"
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
              sx={{ px: 1.25, minWidth: 0 }}
            >
              1M
            </Button>
            <Button
              variant={incrementAmount === 300 ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onIncrementSet(300)} // 5 minutes
              sx={{ px: 1.25, minWidth: 0 }}
            >
              5M
            </Button>
            <Button
              variant={incrementAmount === 900 ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onIncrementSet(900)} // 15 minutes
              sx={{ px: 1.25, minWidth: 0 }}
            >
              15M
            </Button>
          </Box>
        </Box>
      </PermissionWrapper>
    </>
  );
};
