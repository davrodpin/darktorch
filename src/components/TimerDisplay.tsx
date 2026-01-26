import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { LocalFireDepartment } from '@mui/icons-material';
import { useTimerStore } from '../store/timerStore';
import { createTimeDisplay } from '../utils/timeUtils';

export const TimerDisplay: React.FC = () => {
  const { remaining, isRunning, duration } = useTimerStore();
  const timeDisplay = createTimeDisplay(remaining);
  const progress = (remaining / duration) * 100;

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      {/* Status Chip */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LocalFireDepartment
          color={
            timeDisplay.isLowTime ? 'warning' : isRunning ? 'success' : 'action'
          }
          sx={{ fontSize: 24 }}
        />
        <Chip
          label={isRunning ? 'Running' : 'Paused'}
          color={isRunning ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* Main Timer Display */}
      <Typography
        variant="h2"
        component="div"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: { xs: '2.5rem', sm: '3rem' },
          color: timeDisplay.isLowTime ? 'warning.main' : 'text.primary',
          mb: 2,
          letterSpacing: '0.1em',
          textShadow: timeDisplay.isLowTime
            ? '0 0 10px rgba(255, 152, 0, 0.5)'
            : 'none',
        }}
      >
        {timeDisplay.formatted}
      </Typography>

      {/* Progress Indicator */}
      <Box sx={{ maxWidth: '200px', mx: 'auto', mb: 2 }}>
        <Box
          sx={{
            height: '6px',
            backgroundColor: 'background.paper',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: timeDisplay.isLowTime
                ? 'warning.main'
                : 'primary.main',
              transition: 'width 1s linear, background-color 0.3s ease',
            }}
          />
        </Box>
      </Box>

      {/* Additional Info */}
      <Typography variant="caption" color="text.secondary">
        {isRunning
          ? '⏱️ Burning bright'
          : timeDisplay.totalSeconds === 0
            ? '🔥 Extinguished'
            : '⏸️ Waiting'}
      </Typography>
    </Box>
  );
};
