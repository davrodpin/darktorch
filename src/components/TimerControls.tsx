import {
  Alert,
  AlertTitle,
  Box,
  Divider,
} from '@mui/material';
import OBR from '@owlbear-rodeo/sdk';
import React, { useEffect, useRef, useState } from 'react';
import { useLeaderElection } from '../hooks/useLeaderElection';
import { useOwlbearSDK } from '../hooks/useOwlbearSDK';
import { usePlayerRole } from '../hooks/usePlayerRole';
import { useSoundNotifications } from '../hooks/useSoundNotifications';
import { useTimerSync } from '../hooks/useTimerSync';
import { useTimerIncrementAmount, useTimerStore } from '../store/timerStore';
import { GMControls } from './GMControls';
import { PlayerControls } from './PlayerControls';

export const TimerControls: React.FC = () => {
  const { isRunning, remaining, duration, setIncrementAmount, displayMode, visibilityMode, autoExtinguish } =
    useTimerStore();
  const incrementAmount = useTimerIncrementAmount();
  const { playAdjustmentSound, initAudioOnUserInteraction } = useSoundNotifications();
  const { isReady } = useOwlbearSDK();
  const { leaderState } = useLeaderElection();
  const { isGM } = usePlayerRole();
  const {
    syncStart,
    syncPause,
    syncReset,
    syncSetTime,
    syncSetDisplayMode,
    syncSetVisibilityMode,
    syncSetAutoExtinguish,
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

  const handleDisplayModeChange = (nextMode: 'number' | 'hourglass' | 'torch') => {
    initAudioOnUserInteraction();
    syncSetDisplayMode(nextMode);
  };

  const handleVisibilityModeChange = (nextMode: 'EVERYONE' | 'GM_ONLY') => {
    initAudioOnUserInteraction();
    syncSetVisibilityMode(nextMode);
  };

  const handleAutoExtinguishChange = (enabled: boolean) => {
    initAudioOnUserInteraction();
    syncSetAutoExtinguish(enabled);
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

      {/* Role-based controls */}
      {isGM ? (
        <GMControls
          onStartPause={handleStartPause}
          onReset={syncReset}
          isRunning={isRunning}
          isResume={isResume}
          isDisabled={isDisabled}
          isLeader={isLeader}
          visibilityMode={visibilityMode}
          onVisibilityChange={handleVisibilityModeChange}
          autoExtinguish={autoExtinguish}
          onAutoExtinguishChange={handleAutoExtinguishChange}
          displayMode={displayMode}
          onDisplayModeChange={handleDisplayModeChange}
          onAddTime={handleAddTime}
          onRemoveTime={handleRemoveTime}
          onIncrementSet={handleIncrementSet}
          remaining={remaining}
          duration={duration}
          incrementAmount={incrementAmount}
        />
      ) : (
        <PlayerControls
          displayMode={displayMode}
          onDisplayModeChange={handleDisplayModeChange}
        />
      )}

    </Box>
  );
};
