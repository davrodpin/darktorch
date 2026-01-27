import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
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
} from '@mui/icons-material';
import { useTimerStore } from '../store/timerStore';
import { useTimerIncrementAmount } from '../store/timerStore';
import { useSoundNotifications } from '../hooks/useSoundNotifications';
import { useTimerSync } from '../hooks/useTimerSync';
import { PermissionWrapper } from './PermissionWrapper';

export const TimerControls: React.FC = () => {
  const { isRunning, remaining, setIncrementAmount } = useTimerStore();
  const incrementAmount = useTimerIncrementAmount();
  const { playAdjustmentSound, initAudioOnUserInteraction } = useSoundNotifications();
  const { syncStart, syncPause, syncReset, syncSetTime, isLeader, connectionStatus } = useTimerSync();

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
