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
  const [editStartMinutes, setEditStartMinutes] = useState('');
  const [editStartSeconds, setEditStartSeconds] = useState('');
  const [editCurrentMinutes, setEditCurrentMinutes] = useState('');
  const [editCurrentSeconds, setEditCurrentSeconds] = useState('');
  const [showCurrentTimeFlash, setShowCurrentTimeFlash] = useState(false);
  const { playAdjustmentSound } = useSoundNotifications();

  const canEditTime = isGM && isLeader;
  const MIN_DURATION_SECONDS = 60;

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

  // Clear flash after animation completes
  useEffect(() => {
    if (!showCurrentTimeFlash) return;
    const t = setTimeout(() => setShowCurrentTimeFlash(false), 1200);
    return () => clearTimeout(t);
  }, [showCurrentTimeFlash]);

  const handleEnterEditMode = () => {
    if (!canEditTime) return;

    if (isRunning) {
      syncPause();
    }
    setEditStartMinutes(Math.floor(duration / 60).toString());
    setEditStartSeconds((duration % 60).toString().padStart(2, '0'));
    setEditCurrentMinutes(Math.floor(remaining / 60).toString());
    setEditCurrentSeconds((remaining % 60).toString().padStart(2, '0'));
    setShowCurrentTimeFlash(false);
    setIsEditing(true);
  };

  const handleSaveTime = () => {
    if (!canEditTime) return;

    const startTotal = Math.max(
      MIN_DURATION_SECONDS,
      (parseInt(editStartMinutes, 10) || 0) * 60 + (parseInt(editStartSeconds, 10) || 0)
    );
    const currentTotal =
      (parseInt(editCurrentMinutes, 10) || 0) * 60 + (parseInt(editCurrentSeconds, 10) || 0);

    if (currentTotal > startTotal) {
      setShowCurrentTimeFlash(true);
      return;
    }

    syncSetTime(currentTotal, startTotal);
    playAdjustmentSound(true);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditStartMinutes(Math.floor(duration / 60).toString());
    setEditStartSeconds((duration % 60).toString().padStart(2, '0'));
    setEditCurrentMinutes(Math.floor(remaining / 60).toString());
    setEditCurrentSeconds((remaining % 60).toString().padStart(2, '0'));
    setShowCurrentTimeFlash(false);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTime();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const inputStyle = {
    textAlign: 'center' as const,
    fontSize: '2.25rem',
    width: '72px',
    fontFamily:
      '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: 'bold' as const,
  };
  const secondsInputStyle = { ...inputStyle, width: '64px' };
  const timeInputSx = {
    '& .MuiOutlinedInput-input': { px: 1 },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'black',
      borderWidth: '2px',
      boxShadow: 'none',
    },
    '& .MuiOutlinedInput-root.Mui-focusVisible .MuiOutlinedInput-notchedOutline': {
      borderColor: 'black',
      borderWidth: '2px',
      boxShadow: 'none',
    },
  };
  const colonStyle = {
    fontFamily:
      '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: 'bold' as const,
    fontSize: '2.25rem',
    color: 'text.primary',
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

  const isPristine = !isRunning && remaining === duration && !isCompleted;

  return (
    <Box
      sx={{
        textAlign: 'center',
        pt: isEditing ? 0.5 : displayMode === 'hourglass' ? 1 : 2,
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
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                width: '100%',
                px: 2,
                boxSizing: 'border-box',
                '@keyframes currentTimeFlash': {
                  '0%, 100%': { boxShadow: 'none' },
                  '50%': {
                    boxShadow: '0 0 0 2px',
                    boxShadowColor: 'error.main',
                  },
                },
              }}
              onBlur={handleContainerBlur}
              tabIndex={-1}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Starting time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={editStartMinutes}
                    onChange={(e) => setEditStartMinutes(e.target.value.replace(/[^\d]/g, ''))}
                    onKeyDown={handleKeyPress}
                    sx={{
                      ...timeInputSx,
                      ...(showCurrentTimeFlash && {
                        animation: 'currentTimeFlash 0.4s ease-in-out 3',
                        borderRadius: 1,
                      }),
                    }}
                    inputProps={{
                      min: 0,
                      max: 999,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      'aria-label': 'Starting time minutes',
                      style: inputStyle,
                    }}
                    variant="outlined"
                    size="small"
                  />
                  <Typography component="div" sx={colonStyle}>:</Typography>
                  <TextField
                    value={editStartSeconds}
                    onChange={(e) => setEditStartSeconds(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                    onKeyDown={handleKeyPress}
                    sx={{
                      ...timeInputSx,
                      ...(showCurrentTimeFlash && {
                        animation: 'currentTimeFlash 0.4s ease-in-out 3',
                        borderRadius: 1,
                      }),
                    }}
                    inputProps={{
                      min: 0,
                      max: 59,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      'aria-label': 'Starting time seconds',
                      style: secondsInputStyle,
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Current time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                  value={editCurrentMinutes}
                  onChange={(e) => setEditCurrentMinutes(e.target.value.replace(/[^\d]/g, ''))}
                  onKeyDown={handleKeyPress}
                  sx={{
                    ...timeInputSx,
                    ...(showCurrentTimeFlash && {
                      animation: 'currentTimeFlash 0.4s ease-in-out 3',
                      borderRadius: 1,
                    }),
                  }}
                  inputProps={{
                    min: 0,
                    max: 999,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    'aria-label': 'Current time minutes',
                    style: inputStyle,
                  }}
                  variant="outlined"
                  size="small"
                  autoFocus
                />
                <Typography component="div" sx={colonStyle}>:</Typography>
                <TextField
                  value={editCurrentSeconds}
                  onChange={(e) => setEditCurrentSeconds(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  onKeyDown={handleKeyPress}
                  sx={{
                    ...timeInputSx,
                    ...(showCurrentTimeFlash && {
                      animation: 'currentTimeFlash 0.4s ease-in-out 3',
                      borderRadius: 1,
                    }),
                  }}
                  inputProps={{
                    min: 0,
                    max: 59,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    'aria-label': 'Current time seconds',
                    style: secondsInputStyle,
                  }}
                  variant="outlined"
                  size="small"
                />
                </Box>
              </Box>
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

      {/* Helper text for players when timer hasn't started yet */}
      {isPristine && !isGM && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, textAlign: 'center' }}
        >
          Waiting for the GM to start the torch timer.
        </Typography>
      )}

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
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                width: '100%',
                px: 2,
                boxSizing: 'border-box',
                '@keyframes currentTimeFlashHourglass': {
                  '0%, 100%': { boxShadow: 'none' },
                  '50%': {
                    boxShadow: '0 0 0 2px',
                    boxShadowColor: 'error.main',
                  },
                },
              }}
              onBlur={handleContainerBlur}
              tabIndex={-1}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Starting time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={editStartMinutes}
                    onChange={(e) => setEditStartMinutes(e.target.value.replace(/[^\d]/g, ''))}
                    onKeyDown={handleKeyPress}
                    sx={{
                      ...timeInputSx,
                      ...(showCurrentTimeFlash && {
                        animation: 'currentTimeFlashHourglass 0.4s ease-in-out 3',
                        borderRadius: 1,
                      }),
                    }}
                    inputProps={{
                      min: 0,
                      max: 999,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      'aria-label': 'Starting time minutes',
                      style: inputStyle,
                    }}
                    variant="outlined"
                    size="small"
                  />
                  <Typography component="div" sx={colonStyle}>:</Typography>
                  <TextField
                    value={editStartSeconds}
                    onChange={(e) => setEditStartSeconds(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                    onKeyDown={handleKeyPress}
                    sx={{
                      ...timeInputSx,
                      ...(showCurrentTimeFlash && {
                        animation: 'currentTimeFlashHourglass 0.4s ease-in-out 3',
                        borderRadius: 1,
                      }),
                    }}
                    inputProps={{
                      min: 0,
                      max: 59,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      'aria-label': 'Starting time seconds',
                      style: secondsInputStyle,
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Current time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={editCurrentMinutes}
                  onChange={(e) => setEditCurrentMinutes(e.target.value.replace(/[^\d]/g, ''))}
                  onKeyDown={handleKeyPress}
                  sx={{
                    ...timeInputSx,
                    ...(showCurrentTimeFlash && {
                      animation: 'currentTimeFlashHourglass 0.4s ease-in-out 3',
                      borderRadius: 1,
                    }),
                  }}
                  inputProps={{
                    min: 0,
                    max: 999,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    'aria-label': 'Current time minutes',
                    style: inputStyle,
                  }}
                  variant="outlined"
                  size="small"
                  autoFocus
                />
                <Typography component="div" sx={colonStyle}>:</Typography>
                <TextField
                  value={editCurrentSeconds}
                  onChange={(e) => setEditCurrentSeconds(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  onKeyDown={handleKeyPress}
                  sx={{
                    ...timeInputSx,
                    ...(showCurrentTimeFlash && {
                      animation: 'currentTimeFlashHourglass 0.4s ease-in-out 3',
                      borderRadius: 1,
                    }),
                  }}
                  inputProps={{
                    min: 0,
                    max: 59,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    'aria-label': 'Current time seconds',
                    style: secondsInputStyle,
                  }}
                  variant="outlined"
                  size="small"
                />
                </Box>
              </Box>
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
                showPulse={showPulse}
              />
            </Box>
          )}
        </Box>
      </Fade>

      {/* Development-only debug readout for sync troubleshooting */}
      {import.meta.env.DEV && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: 'block' }}
        >
          debug: remaining={remaining}s, running={String(isRunning)}, gm={String(isGM)}
        </Typography>
      )}

    </Box>
  );
};
