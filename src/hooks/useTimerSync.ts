import { useCallback, useEffect } from "react";
import timerSyncService from "../services/timerSync";
import { useTimerActions, useTimerStore } from "../store/timerStore";
import type { TimerSyncEvent, TimerSyncState } from "../types";
import { useLeaderElection } from "./useLeaderElection";
import { useOwlbearSDK } from "./useOwlbearSDK";
import { usePlayerRole } from "./usePlayerRole";

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
      id: "default",
      version: Date.now(),
      lastModified: Date.now(),
      lastModifiedBy: player?.id || "unknown",
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
      // Ignore our own events (when we know our player id), but
      // do NOT drop events just because the player role hasn't
      // finished loading yet. Early events (e.g. START) must still
      // be processed on follower clients.
      if (player && event.userId === player.id) return;

      // Limited logging for sync events (only for full-sync requests)
      if (event.type === "SYNC") {
        const payload = event.payload as Partial<TimerSyncState> & {
          requestFullSync?: boolean;
        };
        if (payload.requestFullSync) {
          console.log(
            `Timer sync requested from ${event.userId ?? "unknown"}`,
          );
        }
      }

      switch (event.type) {
        case "START":
          // Leader started the timer – start locally as well.
          timerActions.start();
          break;

        case "PAUSE":
          // Leader paused the timer – pause locally as well.
          timerActions.pause();
          break;

        case "RESET":
          timerActions.reset();
          break;

        case "UPDATE": {
          const payload = event.payload as Partial<TimerSyncState>;

          if (payload.remaining !== undefined) {
            timerActions.setTime(payload.remaining);
          }
          // Display mode is local-only - ignore incoming displayMode from other clients
          if (payload.visibilityMode !== undefined) {
            timerActions.setVisibilityMode(payload.visibilityMode);
          }
          break;
        }

        case "SYNC": {
          const payload = event.payload as Partial<TimerSyncState> & {
            requestFullSync?: boolean;
          };

          // Handle full sync request: only the current leader responds by
          // broadcasting its full state back out.
          if (payload.requestFullSync && isCurrentPlayerLeader()) {
            timerSyncService.broadcastTimerSync(createSyncState());
            return;
          }

          // For regular SYNC payloads we always treat the incoming state as
          // authoritative (except when sent by ourselves, which is filtered
          // earlier). This ensures that GM adjustments using SYNC are applied
          // even if local leader election disagrees.
          if (payload.remaining !== undefined) {
            timerActions.setTime(payload.remaining);
          }

          if (payload.isRunning !== undefined) {
            if (payload.isRunning && !isRunning) {
              timerActions.start();
            } else if (!payload.isRunning && isRunning) {
              timerActions.pause();
            }
          }

          // Display mode is local-only - ignore incoming displayMode from other clients

          if (payload.visibilityMode !== undefined) {
            timerActions.setVisibilityMode(payload.visibilityMode);
          }
          break;
        }

        default:
          console.warn("Unknown sync event type:", event.type);
          break;
      }
    },
    [player, isCurrentPlayerLeader, timerActions, createSyncState, isRunning],
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
      console.warn("Only the leader can start the timer");
    }
  }, [isCurrentPlayerLeader, timerActions, createSyncState]);

  const syncPause = useCallback(() => {
    const isPlayerLeader = isCurrentPlayerLeader();
    if (isPlayerLeader) {
      timerActions.pause();
      timerSyncService.broadcastTimerPause(createSyncState());
    } else {
      console.warn("Only the leader can pause the timer");
    }
  }, [isCurrentPlayerLeader, timerActions, createSyncState]);

  const syncReset = useCallback(() => {
    const isPlayerLeader = isCurrentPlayerLeader();
    if (isPlayerLeader) {
      timerActions.reset();
      timerSyncService.broadcastTimerReset(createSyncState());
    } else {
      console.warn("Only the leader can reset the timer");
    }
  }, [isCurrentPlayerLeader, timerActions, createSyncState]);

  const syncSetTime = useCallback(
    (seconds: number) => {
      // Always update local store
      timerActions.setTime(seconds);

      // Only GMs or the elected leader should broadcast authoritative time
      const isPlayerLeader = isCurrentPlayerLeader();
      if (!isGM && !isPlayerLeader) {
        return;
      }

      const syncState = createSyncState();
      syncState.remaining = seconds;

      // Use a full SYNC broadcast so followers immediately adopt the
      // authoritative state from the GM, just like the heartbeat path.
      timerSyncService.broadcastTimerSync(syncState);
    },
    [isCurrentPlayerLeader, timerActions, createSyncState, isGM],
  );

  const syncSetDisplayMode = useCallback(
    (mode: TimerSyncState["displayMode"]) => {
      // Display mode is a local preference - update local store only, no broadcast
      timerActions.setDisplayMode(mode);
    },
    [timerActions],
  );

  const syncSetVisibilityMode = useCallback(
    (mode: TimerSyncState["visibilityMode"]) => {
      if (!isGM) {
        console.warn("Only the Game Master can change visibility mode");
        return;
      }

      timerActions.setVisibilityMode(mode);

      const syncState = createSyncState();
      syncState.visibilityMode = mode;
      timerSyncService.broadcastTimerUpdate(syncState);
    },
    [isGM, timerActions, createSyncState],
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
