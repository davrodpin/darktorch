import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Fade,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  LocalFireDepartment,
  NotificationsActive,
} from '@mui/icons-material';
import { useTimerStore } from '../store/timerStore';
import { useTimerIsCompleted } from '../store/timerStore';
import { createTimeDisplay } from '../utils/timeUtils';
import { useSoundNotifications } from '../hooks/useSoundNotifications';

export const TimerDisplay: React.FC = () => {
  const { remaining, isRunning, duration, pause, setTime } = useTimerStore();
  const isCompleted = useTimerIsCompleted();
  const timeDisplay = createTimeDisplay(remaining, isCompleted);
  const progress = (remaining / duration) * 100;
  const [showPulse, setShowPulse] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const [editSeconds, setEditSeconds] = useState('');
  const { playAdjustmentSound } = useSoundNotifications();

  // Trigger pulse animation when timer completes
  useEffect(() => {
    if (isCompleted && !showPulse) {
      const timer = setTimeout(() => {
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 3000);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, showPulse]);

  // Initialize edit values when entering edit mode
  const handleEnterEditMode = () => {
    if (isRunning) {
      pause();
    }
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    setEditMinutes(minutes.toString());
    setEditSeconds(seconds.toString());
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    const minutes = parseInt(editMinutes) || 0;
    const seconds = parseInt(editSeconds) || 0;
    const totalSeconds = Math.min(minutes * 60 + seconds, 3600); // Cap at 1 hour
    setTime(totalSeconds);
    playAdjustmentSound(true);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    const originalMinutes = Math.floor(remaining / 60);
    const originalSeconds = remaining % 60;
    setEditMinutes(originalMinutes.toString());
    setEditSeconds(originalSeconds.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTime();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    // Only cancel if focus moves outside the entire container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleCancelEdit();
    }
  };

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
        <Fade in={isCompleted} timeout={500}>
          <Box sx={{ position: 'absolute' }}>
            <NotificationsActive
              color="error"
              sx={{
                fontSize: 28,
                animation: showPulse ? 'pulse 1s infinite' : 'none',
              }}
            />
          </Box>
        </Fade>
        <LocalFireDepartment
          color={
            isCompleted
              ? 'error'
              : timeDisplay.isLowTime
                ? 'warning'
                : isRunning
                  ? 'success'
                  : 'action'
          }
          sx={{
            fontSize: 24,
            opacity: isCompleted ? 0.3 : 1,
          }}
        />
        <Chip
          label={
            isCompleted
              ? 'Time\'s Up!'
              : isRunning
                ? 'Running'
                : 'Paused'
          }
          color={isCompleted ? 'error' : isRunning ? 'success' : 'default'}
          size="small"
          variant={isCompleted ? 'filled' : 'outlined'}
        />
      </Box>

      {/* Main Timer Display */}
      {isEditing ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 2,
          }}
          onBlur={handleContainerBlur}
          tabIndex={-1}
        >
          <TextField
            value={editMinutes}
            onChange={(e) => setEditMinutes(e.target.value)}
            onKeyDown={handleKeyPress}
            inputProps={{
              min: 0,
              max: 60,
              style: {
                textAlign: 'center',
                fontSize: '2.5rem',
                width: '80px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              },
            }}
            variant="outlined"
            size="small"
            autoFocus
          />
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', sm: '3rem' },
              color: 'text.primary',
            }}
          >
            :
          </Typography>
          <TextField
            value={editSeconds}
            onChange={(e) => setEditSeconds(e.target.value)}
            onKeyDown={handleKeyPress}
            inputProps={{
              min: 0,
              max: 59,
              style: {
                textAlign: 'center',
                fontSize: '2.5rem',
                width: '80px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              },
            }}
            variant="outlined"
            size="small"
          />
        </Box>
      ) : (
        <Tooltip title="Click to edit time (Enter to save, Escape or click outside to cancel)" placement="top">
          <Typography
            variant="h2"
            component="div"
            onClick={handleEnterEditMode}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', sm: '3rem' },
              color: isCompleted
                ? 'error.main'
                : timeDisplay.isLowTime
                  ? 'warning.main'
                  : 'text.primary',
              mb: 2,
              letterSpacing: '0.1em',
              textShadow: isCompleted
                ? '0 0 20px rgba(244, 67, 54, 0.8)'
                : timeDisplay.isLowTime
                  ? '0 0 10px rgba(255, 152, 0, 0.5)'
                  : 'none',
              animation: isCompleted && showPulse
                ? 'pulse 0.5s ease-in-out infinite alternate'
                : 'none',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                transition: 'background-color 0.2s ease',
              },
            }}
          >
            {timeDisplay.formatted}
          </Typography>
        </Tooltip>
      )}

      {/* Progress Indicator */}
      <Box sx={{ maxWidth: '200px', mx: 'auto', mb: 2 }}>
        <Box
          sx={{
            height: '6px',
            backgroundColor: 'background.paper',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            opacity: isCompleted ? 0.5 : 1,
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: isCompleted ? 0 : `${progress}%`,
              backgroundColor: isCompleted
                ? 'error.main'
                : timeDisplay.isLowTime
                  ? 'warning.main'
                  : 'primary.main',
              transition: 'width 1s linear, background-color 0.3s ease',
              animation: isCompleted && showPulse
                ? 'pulse 1s ease-in-out infinite'
                : 'none',
            }}
          />
        </Box>
      </Box>

      {/* Additional Info */}
      <Typography
        variant="caption"
        color={isCompleted ? 'error.main' : 'text.secondary'}
        sx={{
          animation: isCompleted && showPulse
            ? 'pulse 1s ease-in-out infinite'
            : 'none',
        }}
      >
        {isCompleted
          ? '🚨 Time\'s Up! 🔥 Extinguished'
          : isRunning
            ? '⏱️ Burning bright'
            : timeDisplay.totalSeconds === 0
              ? '🔥 Extinguished'
              : '⏸️ Waiting'}
      </Typography>
    </Box>
  );
};
