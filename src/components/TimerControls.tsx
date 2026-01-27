import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Add,
  Remove,
  HourglassEmpty,
  Timer,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTimerStore } from '../store/timerStore';
import { useTimerIncrementAmount } from '../store/timerStore';
import { useSoundNotifications } from '../hooks/useSoundNotifications';
import { useTimerSync } from '../hooks/useTimerSync';
import { PermissionWrapper } from './PermissionWrapper';

export const TimerControls: React.FC = () => {
  const { isRunning, remaining, setIncrementAmount, displayMode, visibilityMode } =
    useTimerStore();
  const incrementAmount = useTimerIncrementAmount();
  const { playAdjustmentSound, initAudioOnUserInteraction } = useSoundNotifications();
  const {
    syncStart,
    syncPause,
    syncReset,
    syncSetTime,
    syncSetDisplayMode,
    syncSetVisibilityMode,
    isLeader,
    connectionStatus,
  } = useTimerSync();

  const handleStartPause = () => {
    initAudioOnUserInteraction(); // Initialize audio on first interaction
    if (isRunning) {
      syncPause();
    } else {
      syncStart();
    }
  };

  const handleAddTime = () => {
    syncSetTime(remaining + incrementAmount);
    playAdjustmentSound(true);
  };

  const handleRemoveTime = () => {
    syncSetTime(remaining - incrementAmount);
    playAdjustmentSound(false);
  };

  const handleIncrementSet = (seconds: number) => {
    setIncrementAmount(seconds);
    playAdjustmentSound(true);
  };

  const handleDisplayModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextMode: 'number' | 'hourglass' | null
  ) => {
    if (!nextMode) return;
    initAudioOnUserInteraction();
    syncSetDisplayMode(nextMode);
  };

  const handleVisibilityModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextMode: 'EVERYONE' | 'GM_ONLY' | null
  ) => {
    if (!nextMode) return;
    initAudioOnUserInteraction();
    syncSetVisibilityMode(nextMode);
  };

  const isDisabled = remaining === 0 && !isRunning;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
      }}
    >
      {/* Status Indicator */}
      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Typography variant="caption" color="text.secondary">
          {isLeader ? '👑 Timer Leader' : '👁️ Following'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {connectionStatus.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </Typography>
      </Box>

      {/* Display + Visibility settings (GM-only, leader-applied) */}
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
          <Tooltip
            title={
              isLeader ? 'Display mode' : 'Only the leader can change display mode'
            }
            disableHoverListener={isLeader}
            disableFocusListener={isLeader}
            disableTouchListener={isLeader}
          >
            <span style={{ display: 'inline-flex' }}>
              <ToggleButtonGroup
                size="small"
                value={displayMode}
                exclusive
                onChange={handleDisplayModeChange}
                disabled={!isLeader}
                aria-label="Display mode"
              >
                <ToggleButton value="number" aria-label="Numeric display">
                  <Tooltip title="Show remaining time as MM:SS." placement="top">
                    <span style={{ display: 'inline-flex' }}>
                      <Timer fontSize="small" />
                    </span>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="hourglass" aria-label="Hourglass display">
                  <Tooltip
                    title="Show an hourglass animation (no numeric timer)."
                    placement="top"
                  >
                    <span style={{ display: 'inline-flex' }}>
                      <HourglassEmpty fontSize="small" />
                    </span>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </span>
          </Tooltip>

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
              <ToggleButtonGroup
                size="small"
                value={visibilityMode}
                exclusive
                onChange={handleVisibilityModeChange}
                disabled={!isLeader}
                aria-label="Visibility mode"
              >
                <ToggleButton value="EVERYONE" aria-label="Everyone can see">
                  <Tooltip title="Everyone can see the timer." placement="top">
                    <span style={{ display: 'inline-flex' }}>
                      <Visibility fontSize="small" />
                    </span>
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="GM_ONLY" aria-label="GM only can see">
                  <Tooltip
                    title="Only the GM can see the timer. Players see a hidden placeholder."
                    placement="top"
                  >
                    <span style={{ display: 'inline-flex' }}>
                      <VisibilityOff fontSize="small" />
                    </span>
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </span>
          </Tooltip>
        </Box>
      </PermissionWrapper>

      {/* Main Control Buttons - Only leaders can control */}
      <PermissionWrapper 
        requiredRole="GM" 
        fallback={
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {isLeader ? 'Timer is controlled by you' : 'Timer is controlled by Game Master'}
            </Typography>
          </Box>
        }
      >
        <ButtonGroup variant="contained" size="large">
          <Button
            onClick={handleStartPause}
            disabled={isDisabled}
            startIcon={isRunning ? <Pause /> : <PlayArrow />}
            sx={{
              minWidth: '100px',
              backgroundColor: isRunning ? 'warning.main' : 'primary.main',
              '&:hover': {
                backgroundColor: isRunning ? 'warning.dark' : 'primary.dark',
              },
            }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            onClick={syncReset}
            startIcon={<Refresh />}
            color="secondary"
            sx={{ minWidth: '80px' }}
          >
            Reset
          </Button>
        </ButtonGroup>
      </PermissionWrapper>

      {/* Time Adjustment Controls - Only leaders can adjust time */}
      <PermissionWrapper requiredRole="GM">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`Remove ${incrementAmount / 60} minute${incrementAmount / 60 !== 1 ? 's' : ''}`}>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                onClick={handleRemoveTime}
                disabled={remaining <= incrementAmount}
                color="primary"
                size="small"
              >
                <Remove />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              px: 2,
              py: 1,
              backgroundColor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <HourglassEmpty sx={{ fontSize: 20, color: 'text.secondary' }} />
          </Box>

          <Tooltip title={`Add ${incrementAmount / 60} minute${incrementAmount / 60 !== 1 ? 's' : ''}`}>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                onClick={handleAddTime}
                disabled={remaining >= 3600} // Don't exceed 1 hour
                color="primary"
                size="small"
              >
                <Add />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </PermissionWrapper>

      {/* Increment Amount Selection - Only leaders can change increment */}
      <PermissionWrapper requiredRole="GM">
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant={incrementAmount === 60 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleIncrementSet(60)} // 1 minute
          >
            1m
          </Button>
          <Button
            variant={incrementAmount === 300 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleIncrementSet(300)} // 5 minutes
          >
            5m
          </Button>
          <Button
            variant={incrementAmount === 900 ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleIncrementSet(900)} // 15 minutes
          >
            15m
          </Button>
        </Box>
      </PermissionWrapper>

    </Box>
  );
};
