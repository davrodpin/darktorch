import { useEffect, useCallback } from 'react';
import { usePlayerRole } from './usePlayerRole';
import { useLeaderElection } from './useLeaderElection';
import { useOwlbearSDK } from './useOwlbearSDK';
import timerSyncService from '../services/timerSync';
import { useTimerStore, useTimerActions } from '../store/timerStore';
import type { TimerSyncEvent, TimerSyncState } from '../types';

export const useTimerSync = () => {
  const { player, isGM } = usePlayerRole();
  const { isCurrentPlayerLeader } = useLeaderElection();
  const { isReady, connectionState } = useOwlbearSDK();
  const timerActions = useTimerActions();

  // Use individual selectors to avoid getSnapshot issues
  const timerState = useTimerStore();
  const remaining = timerState.remaining;
  const isRunning = timerState.isRunning;
  const soundEnabled = timerState.soundEnabled;
  const isCompleted = timerState.isCompleted;
  const incrementAmount = timerState.incrementAmount;
  const duration = timerState.duration;
  const displayMode = timerState.displayMode;
  const visibilityMode = timerState.visibilityMode;

  // Create timer sync state from current timer state
  const createSyncState = useCallback((): TimerSyncState => {
    return {
      remaining,
      isRunning,
      soundEnabled,
      isCompleted,
      incrementAmount,
      duration,
      displayMode,
      visibilityMode,
      id: 'default',
      version: Date.now(),
      lastModified: Date.now(),
      lastModifiedBy: player?.id || 'unknown',
      isLeader: isCurrentPlayerLeader(),
      leaderId: isCurrentPlayerLeader() ? player?.id : undefined,
    };
  }, [
    remaining,
    isRunning,
    soundEnabled,
    isCompleted,
    incrementAmount,
    duration,
    displayMode,
    visibilityMode,
    player,
    isCurrentPlayerLeader,
  ]);

  // Handle incoming sync events
  const handleSyncEvent = useCallback(
    (event: TimerSyncEvent): void => {
      if (!player || event.userId === player.id) {
        return; // Ignore our own events
      }

      // Limited logging for sync events
      if (event.type === 'SYNC') {
        console.log(`Timer sync requested from ${event.userId}`);
      }

      switch (event.type) {
        case 'START':
          timerActions.start();
          break;

        case 'PAUSE':
          timerActions.pause();
          break;

        case 'RESET':
          timerActions.reset();
          break;

        case 'UPDATE': {
          const payload = event.payload as Partial<TimerSyncState>;

          if (payload.remaining !== undefined) {
            timerActions.setTime(payload.remaining);
          }
          if (payload.displayMode !== undefined) {
            timerActions.setDisplayMode(payload.displayMode);
          }
          if (payload.visibilityMode !== undefined) {
            timerActions.setVisibilityMode(payload.visibilityMode);
          }
          break;
        }

        case 'SYNC': {
          const payload = event.payload as Partial<TimerSyncState> & {
            requestFullSync?: boolean;
          };

          // Handle full sync request
          if (payload.requestFullSync && isCurrentPlayerLeader()) {
            timerSyncService.broadcastTimerSync(createSyncState());
            return;
          }

          // Handle incoming sync state
          if (!isCurrentPlayerLeader() && payload.remaining !== undefined) {
            timerActions.setTime(payload.remaining);
          }

          if (!isCurrentPlayerLeader() && payload.isRunning !== undefined) {
            if (payload.isRunning && !isRunning) {
              timerActions.start();
            } else if (!payload.isRunning && isRunning) {
              timerActions.pause();
            }
          }

          if (!isCurrentPlayerLeader() && payload.displayMode !== undefined) {
            timerActions.setDisplayMode(payload.displayMode);
          }

          if (!isCurrentPlayerLeader() && payload.visibilityMode !== undefined) {
            timerActions.setVisibilityMode(payload.visibilityMode);
          }
          break;
        }

        default:
          console.warn('Unknown sync event type:', event.type);
          break;
      }
    },
    [player, isCurrentPlayerLeader, timerActions, createSyncState, isRunning]
  );

  // Initialize sync service
  useEffect((): (() => void) | void => {
    if (!isReady) return;

    // Initialize timer sync service
    timerSyncService.initialize().catch(console.error);

    // Get current leader status
    const isPlayerLeader = isCurrentPlayerLeader();

    // Subscribe to sync events
    const unsubscribe = timerSyncService.onSyncEvent(handleSyncEvent);

    // Request initial sync if we're not leader
    if (!isPlayerLeader) {
      setTimeout(() => {
        timerSyncService.requestFullSync();
      }, 1000);
    }

    return () => unsubscribe();
  }, [isReady, handleSyncEvent, isCurrentPlayerLeader]);

  // Enhanced timer actions with sync
  const syncStart = useCallback(() => {
    const isPlayerLeader = isCurrentPlayerLeader();
    if (isPlayerLeader) {
      timerActions.start();
      timerSyncService.broadcastTimerStart(createSyncState());
    } else {
      console.warn('Only the leader can start the timer');
    }
  }, [isCurrentPlayerLeader, timerActions, createSyncState]);

  const syncPause = useCallback(() => {
    const isPlayerLeader = isCurrentPlayerLeader();
    if (isPlayerLeader) {
      timerActions.pause();
      timerSyncService.broadcastTimerPause(createSyncState());
    } else {
      console.warn('Only the leader can pause the timer');
    }
  }, [isCurrentPlayerLeader, timerActions, createSyncState]);

  const syncReset = useCallback(() => {
    const isPlayerLeader = isCurrentPlayerLeader();
    if (isPlayerLeader) {
      timerActions.reset();
      timerSyncService.broadcastTimerReset(createSyncState());
    } else {
      console.warn('Only the leader can reset the timer');
    }
  }, [isCurrentPlayerLeader, timerActions, createSyncState]);

  const syncSetTime = useCallback(
    (seconds: number) => {
      timerActions.setTime(seconds);

      const isPlayerLeader = isCurrentPlayerLeader();
      if (isPlayerLeader) {
        const syncState = createSyncState();
        syncState.remaining = seconds;
        timerSyncService.broadcastTimerUpdate(syncState);
      }
    },
    [isCurrentPlayerLeader, timerActions, createSyncState]
  );

  const syncSetDisplayMode = useCallback(
    (mode: TimerSyncState['displayMode']) => {
      if (!isGM) {
        console.warn('Only the Game Master can change display mode');
        return;
      }

      timerActions.setDisplayMode(mode);

      const isPlayerLeader = isCurrentPlayerLeader();
      if (isPlayerLeader) {
        const syncState = createSyncState();
        syncState.displayMode = mode;
        timerSyncService.broadcastTimerUpdate(syncState);
      } else {
        console.warn('Only the leader can change display mode');
      }
    },
    [isGM, isCurrentPlayerLeader, timerActions, createSyncState]
  );

  const syncSetVisibilityMode = useCallback(
    (mode: TimerSyncState['visibilityMode']) => {
      if (!isGM) {
        console.warn('Only the Game Master can change visibility mode');
        return;
      }

      timerActions.setVisibilityMode(mode);

      const isPlayerLeader = isCurrentPlayerLeader();
      if (isPlayerLeader) {
        const syncState = createSyncState();
        syncState.visibilityMode = mode;
        timerSyncService.broadcastTimerUpdate(syncState);
      } else {
        console.warn('Only the leader can change visibility mode');
      }
    },
    [isGM, isCurrentPlayerLeader, timerActions, createSyncState]
  );

  // Retry queued messages when connection is restored
  useEffect(() => {
    if (connectionState.isConnected && !connectionState.isReconnecting) {
      timerSyncService.retryQueuedMessages();
    }
  }, [connectionState]);

  // Periodic sync from leader (heartbeat)
  useEffect(() => {
    const isPlayerLeader = isCurrentPlayerLeader();
    const interval = setInterval(() => {
      if (isPlayerLeader && isRunning) {
        timerSyncService.broadcastTimerSync(createSyncState());
      }
    }, 5000); // Sync every 5 seconds when running

    return () => clearInterval(interval);
  }, [isCurrentPlayerLeader, isRunning, createSyncState]);

  return {
    syncStart,
    syncPause,
    syncReset,
    syncSetTime,
    syncSetDisplayMode,
    syncSetVisibilityMode,
    isLeader: isCurrentPlayerLeader(),
    connectionStatus: timerSyncService.getConnectionStatus(),
    createSyncState,
  };
};
