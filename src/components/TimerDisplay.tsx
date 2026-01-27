import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Fade,
  TextField,
} from '@mui/material';
import {
  LocalFireDepartment,
  NotificationsActive,
} from '@mui/icons-material';
import { useTimerStore, useTimerIsCompleted } from '../store/timerStore';
import { createTimeDisplay } from '../utils/timeUtils';
import { useSoundNotifications } from '../hooks/useSoundNotifications';
import { usePlayerRole } from '../hooks/usePlayerRole';
import { useTimerSync } from '../hooks/useTimerSync';
import { HourglassDisplay } from './HourglassDisplay';

export const TimerDisplay: React.FC = () => {
  const { remaining, isRunning, duration, displayMode, visibilityMode } =
    useTimerStore();
  const isCompleted = useTimerIsCompleted();
  const { isGM } = usePlayerRole();
  const { isLeader, syncPause, syncSetTime } = useTimerSync();
  const timeDisplay = createTimeDisplay(remaining, isCompleted);
  const progress = duration > 0 ? (remaining / duration) * 100 : 0;
  const [showPulse, setShowPulse] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const [editSeconds, setEditSeconds] = useState('');
  const { playAdjustmentSound } = useSoundNotifications();

  const canEditTime = isGM && isLeader;

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
    if (!canEditTime) return;

    if (isRunning) {
      syncPause();
    }
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    setEditMinutes(minutes.toString());
    setEditSeconds(seconds.toString());
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    if (!canEditTime) return;

    const minutes = parseInt(editMinutes) || 0;
    const seconds = parseInt(editSeconds) || 0;
    const totalSeconds = Math.min(minutes * 60 + seconds, duration); // Cap at duration
    syncSetTime(totalSeconds);
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

  // Visibility gating
  if (visibilityMode === 'GM_ONLY' && !isGM) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Chip label="Hidden" size="small" variant="outlined" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Timer is hidden (GM only).
        </Typography>
      </Box>
    );
  }

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
              : timeDisplay.isCriticalTime
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
              : timeDisplay.isCriticalTime
                ? 'Critical'
              : isRunning
                ? 'Running'
                : 'Paused'
          }
          color={
            isCompleted || timeDisplay.isCriticalTime
              ? 'error'
              : isRunning
                ? 'success'
                : 'default'
          }
          size="small"
          variant={isCompleted ? 'filled' : 'outlined'}
        />
      </Box>

      {/* Main Timer Display */}
      <Fade in={displayMode === 'number'} timeout={200} mountOnEnter unmountOnExit>
        <Box>
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
                  max: Math.floor(duration / 60),
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
                  : timeDisplay.isCriticalTime
                    ? 'error.light'
                    : timeDisplay.isLowTime
                      ? 'warning.main'
                      : 'text.primary',
                mb: 2,
                letterSpacing: '0.1em',
                textShadow: isCompleted
                  ? '0 0 20px rgba(244, 67, 54, 0.8)'
                  : timeDisplay.isCriticalTime
                    ? '0 0 14px rgba(244, 67, 54, 0.55)'
                    : timeDisplay.isLowTime
                      ? '0 0 10px rgba(255, 152, 0, 0.5)'
                      : 'none',
                animation: isCompleted && showPulse
                  ? 'pulse 0.5s ease-in-out infinite alternate'
                  : 'none',
                cursor: canEditTime ? 'pointer' : 'default',
                '&:hover': canEditTime
                  ? {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1,
                      transition: 'background-color 0.2s ease',
                    }
                  : undefined,
              }}
            >
              {timeDisplay.formatted}
            </Typography>
          )}
        </Box>
      </Fade>

      <Fade
        in={displayMode === 'hourglass'}
        timeout={200}
        mountOnEnter
        unmountOnExit
      >
        <Box sx={{ mb: 2 }}>
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
                  max: Math.floor(duration / 60),
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
            <Box
              onClick={handleEnterEditMode}
              sx={{
                cursor: canEditTime ? 'pointer' : 'default',
                display: 'inline-block',
              }}
            >
              <HourglassDisplay
                progress={duration > 0 ? remaining / duration : 0}
                isRunning={isRunning}
                isLowTime={timeDisplay.isLowTime}
                isCriticalTime={timeDisplay.isCriticalTime}
                isCompleted={isCompleted}
              />
            </Box>
          )}
        </Box>
      </Fade>

      {/* Progress Indicator */}
      {displayMode === 'number' && (
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
                  : timeDisplay.isCriticalTime
                    ? 'error.light'
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
      )}

      {/* Additional Info */}
      <Typography
        variant="caption"
        color={
          isCompleted
            ? 'error.main'
            : timeDisplay.isCriticalTime
              ? 'error.light'
              : timeDisplay.isLowTime
                ? 'warning.main'
                : 'text.secondary'
        }
        sx={{
          animation: isCompleted && showPulse
            ? 'pulse 1s ease-in-out infinite'
            : 'none',
        }}
      >
        {isCompleted
          ? '🚨 Time\'s Up! 🔥 Extinguished'
          : timeDisplay.isCriticalTime
            ? '⚠️ Almost out!'
          : isRunning
            ? '⏱️ Burning bright'
            : timeDisplay.totalSeconds === 0
              ? '🔥 Extinguished'
              : '⏸️ Waiting'}
      </Typography>
    </Box>
  );
};
