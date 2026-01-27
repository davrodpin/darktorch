import { useEffect, useCallback } from 'react';
import { usePlayerRole } from './usePlayerRole';
import { useLeaderElection } from './useLeaderElection';
import { useOwlbearSDK } from './useOwlbearSDK';
import timerSyncService from '../services/timerSync';
import { useTimerStore, useTimerActions } from '../store/timerStore';
import type { TimerSyncEvent, TimerSyncState } from '../types';

export const useTimerSync = () => {
  const { player } = usePlayerRole();
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

  // Create timer sync state from current timer state
  const createSyncState = useCallback((): TimerSyncState => {
    return {
      remaining,
      isRunning,
      soundEnabled,
      isCompleted,
      incrementAmount,
      duration,
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

        case 'UPDATE':
          if (event.payload.remaining !== undefined) {
            timerActions.setTime(event.payload.remaining);
          }
          break;

        case 'SYNC':
          const payload = event.payload as any;

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
          break;

        default:
          console.warn('Unknown sync event type:', event.type);
          break;
      }
    },
    [player, isCurrentPlayerLeader, timerActions, createSyncState]
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
  }, [isReady, handleSyncEvent]);

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
    isLeader: isCurrentPlayerLeader(),
    connectionStatus: timerSyncService.getConnectionStatus(),
    createSyncState,
  };
};
