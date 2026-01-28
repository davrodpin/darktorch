import {
    Box,
    Chip,
    Fade,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { usePlayerRole } from '../hooks/usePlayerRole';
import { useSoundNotifications } from '../hooks/useSoundNotifications';
import { useTimerSync } from '../hooks/useTimerSync';
import { useTimerIsCompleted, useTimerStore } from '../store/timerStore';
import { createTimeDisplay } from '../utils/timeUtils';
import { HourglassDisplay } from './HourglassDisplay';

export const TimerDisplay: React.FC = () => {
  const { remaining, isRunning, duration, displayMode, visibilityMode } =
    useTimerStore();
  const isCompleted = useTimerIsCompleted();
  const { isGM } = usePlayerRole();
  const { isLeader, syncPause, syncSetTime } = useTimerSync();
  const timeDisplay = createTimeDisplay(remaining, isCompleted);
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
    setEditSeconds(seconds.toString().padStart(2, '0'));
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
    setEditSeconds(originalSeconds.toString().padStart(2, '0'));
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTime();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleMinutesChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    setEditMinutes(cleaned);
  };

  const handleSecondsChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    setEditSeconds(cleaned);
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
    <Box
      sx={{
        textAlign: 'center',
        pt: displayMode === 'hourglass' ? 1 : 2,
        pb: displayMode === 'hourglass' ? 0.25 : 2,
      }}
    >
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
                width: '100%',
                px: 2,
                boxSizing: 'border-box',
              }}
              onBlur={handleContainerBlur}
              tabIndex={-1}
            >
              <TextField
                value={editMinutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    px: 1,
                  },
                }}
                inputProps={{
                  min: 0,
                  max: Math.floor(duration / 60),
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  'aria-label': 'Minutes',
                  style: {
                    textAlign: 'center',
                    fontSize: '3.6rem',
                    width: '96px',
                    fontFamily:
                      '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
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
                  fontFamily:
                    '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontWeight: 'bold',
                  fontSize: '3.6rem',
                  color: 'text.primary',
                }}
              >
                :
              </Typography>
              <TextField
                value={editSeconds}
                onChange={(e) => handleSecondsChange(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    px: 1,
                  },
                }}
                inputProps={{
                  min: 0,
                  max: 59,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  'aria-label': 'Seconds',
                  style: {
                    textAlign: 'center',
                    fontSize: '3.6rem',
                    width: '96px',
                    fontFamily:
                      '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontWeight: 'bold',
                  },
                }}
                variant="outlined"
                size="small"
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
              <Typography
                variant="h2"
                component="div"
                onClick={handleEnterEditMode}
                onKeyDown={(e) => {
                  if (!canEditTime) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEnterEditMode();
                  }
                }}
                role={canEditTime ? 'button' : undefined}
                tabIndex={canEditTime ? 0 : undefined}
                aria-label={canEditTime ? 'Edit time' : undefined}
                sx={{
                  fontFamily:
                    '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontWeight: 800,
                  fontSize: '3.6rem',
                  color: 'text.primary',
                  mb: 2,
                  letterSpacing: '0.08em',
                  animation: isCompleted && showPulse
                    ? 'pulse 0.5s ease-in-out infinite alternate'
                    : !isEditing && timeDisplay.isCriticalTime
                      ? 'criticalTimeFade 0.9s ease-in-out infinite'
                      : !isEditing && timeDisplay.isLowTime
                        ? 'lowTimeFade 1.8s ease-in-out infinite'
                        : 'none',
                  cursor: canEditTime ? 'pointer' : 'default',
                  '&:focus-visible': canEditTime
                    ? {
                        outline: '2px solid',
                        outlineColor: 'common.black',
                        outlineOffset: 3,
                        borderRadius: 1,
                      }
                    : undefined,
                }}
              >
                {timeDisplay.formatted}
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>

      <Fade
        in={displayMode === 'hourglass'}
        timeout={200}
        mountOnEnter
        unmountOnExit
      >
        <Box sx={{ mb: 0.5 }}>
          {isEditing ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 2,
                width: '100%',
                px: 2,
                boxSizing: 'border-box',
              }}
              onBlur={handleContainerBlur}
              tabIndex={-1}
            >
              <TextField
                value={editMinutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    px: 1,
                  },
                }}
                inputProps={{
                  min: 0,
                  max: Math.floor(duration / 60),
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  'aria-label': 'Minutes',
                  style: {
                    textAlign: 'center',
                    fontSize: '3.6rem',
                    width: '96px',
                    fontFamily:
                      '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
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
                  fontFamily:
                    '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontWeight: 'bold',
                  fontSize: '3.6rem',
                  color: 'text.primary',
                }}
              >
                :
              </Typography>
              <TextField
                value={editSeconds}
                onChange={(e) => handleSecondsChange(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    px: 1,
                  },
                }}
                inputProps={{
                  min: 0,
                  max: 59,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  'aria-label': 'Seconds',
                  style: {
                    textAlign: 'center',
                    fontSize: '3.6rem',
                    width: '96px',
                    fontFamily:
                      '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
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

    </Box>
  );
};
