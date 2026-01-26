import React from 'react';
import { Box, Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  Add,
  Remove,
  HourglassEmpty,
} from '@mui/icons-material';
import { useTimerStore } from '../store/timerStore';

export const TimerControls: React.FC = () => {
  const { isRunning, remaining, start, pause, reset, setTime } =
    useTimerStore();

  const handleStartPause = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const handleAddTime = () => {
    setTime(remaining + 300); // Add 5 minutes
  };

  const handleRemoveTime = () => {
    setTime(remaining - 300); // Remove 5 minutes
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
        <Tooltip title="Remove 5 minutes">
          <IconButton
            onClick={handleRemoveTime}
            disabled={remaining <= 300}
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

        <Tooltip title="Add 5 minutes">
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

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setTime(1800)} // 30 minutes
        >
          30m
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setTime(900)} // 15 minutes
        >
          15m
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setTime(300)} // 5 minutes
        >
          5m
        </Button>
      </Box>
    </Box>
  );
};
