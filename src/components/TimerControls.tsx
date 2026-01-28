import {
    Add,
    HourglassEmpty,
    Pause,
    PlayArrow,
    Refresh,
    Remove,
    Timer,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import OBR from '@owlbear-rodeo/sdk';
import React, { useEffect, useRef, useState } from 'react';
import { useLeaderElection } from '../hooks/useLeaderElection';
import { useOwlbearSDK } from '../hooks/useOwlbearSDK';
import { useSoundNotifications } from '../hooks/useSoundNotifications';
import { useTimerSync } from '../hooks/useTimerSync';
import { useTimerIncrementAmount, useTimerStore } from '../store/timerStore';
import { PermissionWrapper } from './PermissionWrapper';
import { TwoIconToggleGroup } from './TwoIconToggleGroup';

export const TimerControls: React.FC = () => {
  const { isRunning, remaining, duration, setIncrementAmount, displayMode, visibilityMode } =
    useTimerStore();
  const incrementAmount = useTimerIncrementAmount();
  const { playAdjustmentSound, initAudioOnUserInteraction } = useSoundNotifications();
  const { isReady } = useOwlbearSDK();
  const { leaderState } = useLeaderElection();
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

  const handleDisplayModeChange = (nextMode: 'number' | 'hourglass') => {
    initAudioOnUserInteraction();
    syncSetDisplayMode(nextMode);
  };

  const handleVisibilityModeChange = (nextMode: 'EVERYONE' | 'GM_ONLY') => {
    initAudioOnUserInteraction();
    syncSetVisibilityMode(nextMode);
  };

  const isDisabled = remaining === 0 && !isRunning;
  const isResume = !isRunning && remaining > 0 && remaining < duration;

  const [showElectionWarning, setShowElectionWarning] = useState(false);
  const loggedElectionRef = useRef(false);
  const loggedConnectionRef = useRef(false);

  useEffect(() => {
    if (!OBR.isAvailable || !isReady) return;

    // If we have a leader, clear any warning and don't schedule.
    if (leaderState.leaderId) {
      setShowElectionWarning(false);
      loggedElectionRef.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      // Still no leader after grace period -> show warning.
      if (!leaderState.leaderId) {
        setShowElectionWarning(true);
        if (!loggedElectionRef.current) {
          loggedElectionRef.current = true;
          console.error('Leader election has not resolved. Timer control may be unavailable.');
        }
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [isReady, leaderState.leaderId]);

  const hasConnectionProblem =
    OBR.isAvailable &&
    connectionStatus.isSetup &&
    (!connectionStatus.isConnected || connectionStatus.queueSize > 0);

  useEffect(() => {
    if (!hasConnectionProblem) {
      loggedConnectionRef.current = false;
      return;
    }
    if (!loggedConnectionRef.current) {
      loggedConnectionRef.current = true;
      console.error(
        'Sync connection problem:',
        JSON.stringify(
          {
            isConnected: connectionStatus.isConnected,
            queueSize: connectionStatus.queueSize,
            retryAttempts: connectionStatus.retryAttempts,
          },
          null,
          2
        )
      );
    }
  }, [
    hasConnectionProblem,
    connectionStatus.isConnected,
    connectionStatus.queueSize,
    connectionStatus.retryAttempts,
  ]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Divider flexItem />

      {(hasConnectionProblem || showElectionWarning) && (
        <Box sx={{ width: '100%' }}>
          {hasConnectionProblem && (
            <Alert severity="warning">
              <AlertTitle>Sync issue</AlertTitle>
              {!connectionStatus.isConnected
                ? 'Connection is unavailable. Timer updates may not reach other players.'
                : `There are ${connectionStatus.queueSize} queued update(s) waiting to send.`}
            </Alert>
          )}

          {showElectionWarning && (
            <Alert severity="warning" sx={{ mt: hasConnectionProblem ? 1 : 0 }}>
              <AlertTitle>Leader election issue</AlertTitle>
              Leader election hasn’t resolved. Timer control may be unavailable.
            </Alert>
          )}
        </Box>
      )}

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
          {/* Start/Reset - uses same ToggleButtonGroup styling as other pairs */}
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
                onClick: handleStartPause,
              },
              {
                value: 'reset',
                ariaLabel: 'Reset',
                tooltip: 'Reset',
                icon: <Refresh fontSize="small" />,
                disabled: !isLeader,
                onClick: syncReset,
              },
            ]}
          />

          <TwoIconToggleGroup<'number' | 'hourglass'>
            ariaLabel="Display mode"
            value={displayMode}
            disabled={!isLeader}
            onChange={handleDisplayModeChange}
            options={[
              {
                value: 'hourglass',
                ariaLabel: 'Hourglass display',
                tooltip: 'Show an hourglass animation (no numeric timer).',
                icon: <HourglassEmpty fontSize="small" />,
              },
              {
                value: 'number',
                ariaLabel: 'Numeric display',
                tooltip: 'Show remaining time as MM:SS.',
                icon: <Timer fontSize="small" />,
              },
            ]}
          />

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
                onChange={handleVisibilityModeChange}
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
                  onClick={handleRemoveTime}
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
              onClick={() => handleIncrementSet(60)} // 1 minute
              sx={{ px: 1.25, minWidth: 0 }}
            >
              1M
            </Button>
            <Button
              variant={incrementAmount === 300 ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleIncrementSet(300)} // 5 minutes
              sx={{ px: 1.25, minWidth: 0 }}
            >
              5M
            </Button>
            <Button
              variant={incrementAmount === 900 ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleIncrementSet(900)} // 15 minutes
              sx={{ px: 1.25, minWidth: 0 }}
            >
              15M
            </Button>
          </Box>
        </Box>
      </PermissionWrapper>

    </Box>
  );
};
