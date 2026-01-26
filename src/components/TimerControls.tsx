import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
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

export const TimerControls: React.FC = () => {
  const { isRunning, remaining, start, pause, reset, setTime, setIncrementAmount } =
    useTimerStore();
  const incrementAmount = useTimerIncrementAmount();
  const { playAdjustmentSound, initAudioOnUserInteraction } = useSoundNotifications();

  const handleStartPause = () => {
    if (isRunning) {
      pause();
    } else {
      initAudioOnUserInteraction(); // Initialize audio on first interaction
      start();
    }
  };

  const handleAddTime = () => {
    setTime(remaining + incrementAmount);
    playAdjustmentSound(true);
  };

  const handleRemoveTime = () => {
    setTime(remaining - incrementAmount);
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
      {/* Main Control Buttons */}
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
          onClick={reset}
          startIcon={<Refresh />}
          color="secondary"
          sx={{ minWidth: '80px' }}
        >
          Reset
        </Button>
      </ButtonGroup>

      {/* Time Adjustment Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={`Remove ${incrementAmount / 60} minute${incrementAmount / 60 !== 1 ? 's' : ''}`}>
          <IconButton
            onClick={handleRemoveTime}
            disabled={remaining <= incrementAmount}
            color="primary"
            size="small"
          >
            <Remove />
          </IconButton>
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
          <IconButton
            onClick={handleAddTime}
            disabled={remaining >= 3600} // Don't exceed 1 hour
            color="primary"
            size="small"
          >
            <Add />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Increment Amount Selection */}
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

    </Box>
  );
};
