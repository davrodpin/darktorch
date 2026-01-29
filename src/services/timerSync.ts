import OBR from "@owlbear-rodeo/sdk";
import {
  TIMER_EVENTS,
  type TimerSyncEvent,
  type TimerSyncState,
} from "../types";
import { safeAsyncOperation } from "../utils/errorHandling";

class TimerSyncService {
  private static instance: TimerSyncService;
  private callbacks: Set<(event: TimerSyncEvent) => void> = new Set();
  private messageQueue: Array<{ event: string; data: any }> = [];
  private isConnected = false;
  private retryAttempts = 0;
  private maxRetries = 3;
  private pendingOperations = new Map<string, any>();
  private isSetup = false;
  private lastFullSyncRequest = 0;
  private readonly FULL_SYNC_THROTTLE_MS = 2000; // Don't request full sync more than once per 2 seconds

  private constructor() {
    // Don't setup immediately - wait for SDK to be ready
  }

  static getInstance(): TimerSyncService {
    if (!TimerSyncService.instance) {
      TimerSyncService.instance = new TimerSyncService();
    }
    return TimerSyncService.instance;
  }

  // Initialize the service when SDK is ready
  async initialize() {
    if (this.isSetup) return;

    await this.setupEventListeners();
    this.isSetup = true;

    // Consider the sync layer "connected" once listeners are registered in OBR.
    // This avoids a false-negative until the first successful outgoing broadcast.
    this.isConnected = OBR.isAvailable;
    this.retryAttempts = 0;
  }

  // Subscribe to sync events
  onSyncEvent(callback: (event: TimerSyncEvent) => void) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Send timer state change to all users
  async broadcastTimerStart(timerState: Partial<TimerSyncState>) {
    return safeAsyncOperation(
      async () => {
        const payload: any = {
          timestamp: Date.now(),
          ...timerState,
        };

        const event: TimerSyncEvent = {
          type: "START",
          timerId: timerState.id || "default",
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.START, event);
      },
      undefined,
      undefined,
    );
  }

  async broadcastTimerPause(timerState: Partial<TimerSyncState>) {
    return safeAsyncOperation(
      async () => {
        const payload: any = {
          timestamp: Date.now(),
          ...timerState,
        };

        const event: TimerSyncEvent = {
          type: "PAUSE",
          timerId: timerState.id || "default",
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.PAUSE, event);
      },
      undefined,
      undefined,
    );
  }

  async broadcastTimerReset(timerState: Partial<TimerSyncState>) {
    return safeAsyncOperation(
      async () => {
        const payload: any = {
          timestamp: Date.now(),
          ...timerState,
        };

        const event: TimerSyncEvent = {
          type: "RESET",
          timerId: timerState.id || "default",
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.RESET, event);
      },
      undefined,
      undefined,
    );
  }

  async broadcastTimerUpdate(timerState: Partial<TimerSyncState>) {
    return safeAsyncOperation(
      async () => {
        const payload: any = {
          timestamp: Date.now(),
          ...timerState,
        };

        const event: TimerSyncEvent = {
          type: "UPDATE",
          timerId: timerState.id || "default",
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        if (import.meta.env.DEV) {
          console.debug("[DarkTorch][broadcastTimerUpdate]", {
            timerId: event.timerId,
            userId: event.userId,
            remaining: (payload as TimerSyncState).remaining,
            displayMode: (payload as TimerSyncState).displayMode,
            visibilityMode: (payload as TimerSyncState).visibilityMode,
          });
        }

        await this.broadcastMessage(TIMER_EVENTS.UPDATE, event);
      },
      undefined,
      undefined,
    );
  }

  async broadcastTimerSync(timerState: TimerSyncState) {
    return safeAsyncOperation(
      async () => {
        const payload: any = {
          timestamp: Date.now(),
          ...timerState,
        };

        const event: TimerSyncEvent = {
          type: "SYNC",
          timerId: timerState.id,
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.SYNC, event);
      },
      undefined,
      undefined,
    );
  }

  // Request full sync from current leader
  async requestFullSync() {
    const now = Date.now();
    if (now - this.lastFullSyncRequest < this.FULL_SYNC_THROTTLE_MS) {
      if (import.meta.env.DEV) {
        console.debug(
          `[DarkTorch][requestFullSync] Throttled (last request ${
            now - this.lastFullSyncRequest
          }ms ago)`,
        );
      }
      return;
    }
    this.lastFullSyncRequest = now;

    const event: TimerSyncEvent = {
      type: "SYNC",
      timerId: "default",
      payload: {
        requestFullSync: true,
        timestamp: now,
      },
      timestamp: now,
      userId: await this.getCurrentUserId(),
    };

    await this.broadcastMessage(TIMER_EVENTS.SYNC, event);
  }

  private isSceneNotReadyError(error: unknown): boolean {
    if (!error) return false;
    const anyErr = error as any;
    const name = typeof anyErr.name === "string" ? anyErr.name : "";
    const message = typeof anyErr.message === "string"
      ? anyErr.message
      : String(anyErr);

    // Owlbear typically uses MissingDataError / \"No scene found\" when the
    // extension is loaded but no scene is currently active. In that case we
    // don't want to treat it as a real connection failure or queue messages.
    return (
      name === "MissingDataError" ||
      message.includes("No scene found") ||
      message.includes("Missing scene")
    );
  }

  private async broadcastMessage(event: string, data: any) {
    try {
      if (!OBR.isAvailable) {
        // Development mode - skip broadcasting
        this.notifyCallbacks({ ...data, type: data.type });
        return;
      }

      await this.retryOperation(() => OBR.broadcast.sendMessage(event, data));

      // Update connection status
      this.isConnected = true;
      this.retryAttempts = 0;
    } catch (error) {
      // If there is no active scene yet, Owlbear may throw a MissingDataError /
      // \"No scene found\". In that case we silently drop the message instead
      // of queueing it forever or flagging a connection problem.
      if (this.isSceneNotReadyError(error)) {
        if (import.meta.env.DEV) {
          console.debug(
            `[DarkTorch][broadcastMessage] Scene not ready for ${event}, dropping sync message`,
          );
        }
        return;
      }

      // Log other broadcast errors at reduced frequency with full details
      if (this.retryAttempts === 0) {
        const errorDetails: any = {};
        if (error instanceof Error) {
          errorDetails.name = error.name;
          errorDetails.message = error.message;
          errorDetails.stack = error.stack;
        } else {
          errorDetails.raw = String(error);
          errorDetails.type = typeof error;
          if (error && typeof error === "object") {
            try {
              errorDetails.keys = Object.keys(error);
              errorDetails.json = JSON.stringify(error, null, 2);
            } catch {
              // Can't stringify
            }
          }
        }
        console.error(`Broadcast ${event} failed:`, errorDetails, error);
      }

      // Queue the message for retry and mark as disconnected
      this.queueMessage(event, data);
      this.isConnected = false;
    }
  }

  private async setupEventListeners() {
    try {
      if (!OBR.isAvailable) {
        // Development mode - skip event listeners
        return;
      }

      // Listen for all timer events
      OBR.broadcast.onMessage(TIMER_EVENTS.START, (event: any) => {
        const data = event.data as TimerSyncEvent;
        const syncEvent: TimerSyncEvent = {
          type: "START",
          timerId: data.timerId,
          payload: data.payload,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.PAUSE, (event: any) => {
        const data = event.data as TimerSyncEvent;
        const syncEvent: TimerSyncEvent = {
          type: "PAUSE",
          timerId: data.timerId,
          payload: data.payload,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.RESET, (event: any) => {
        const data = event.data as TimerSyncEvent;
        const syncEvent: TimerSyncEvent = {
          type: "RESET",
          timerId: data.timerId,
          payload: data.payload,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.UPDATE, (event: any) => {
        const data = event.data as TimerSyncEvent;
        const syncEvent: TimerSyncEvent = {
          type: "UPDATE",
          timerId: data.timerId,
          payload: data.payload,
          timestamp: event.timestamp,
          userId: event.userId,
        };

        if (import.meta.env.DEV) {
          console.debug("[DarkTorch][onMessage][UPDATE]", {
            fromUser: syncEvent.userId,
            timerId: syncEvent.timerId,
            remaining: (syncEvent.payload as TimerSyncState).remaining,
            displayMode: (syncEvent.payload as TimerSyncState).displayMode,
            visibilityMode:
              (syncEvent.payload as TimerSyncState).visibilityMode,
          });
        }

        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.SYNC, (event: any) => {
        const data = event.data as TimerSyncEvent;
        const syncEvent: TimerSyncEvent = {
          type: "SYNC",
          timerId: data.timerId,
          payload: data.payload,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });
    } catch (error) {
      console.error("Failed to setup sync event listeners:", error);
    }
  }

  private handleSyncEvent(event: TimerSyncEvent) {
    // Ignore events from ourselves to prevent echo
    this.getCurrentUserId().then((currentUserId) => {
      if (event.userId === currentUserId) {
        return;
      }

      // Check for conflicts and apply resolution
      if (this.shouldProcessEvent(event)) {
        this.notifyCallbacks(event);
      }
    });
  }

  private shouldProcessEvent(event: TimerSyncEvent): boolean {
    // Check if we have a pending operation that conflicts
    const pendingOp = this.pendingOperations.get(event.timerId);
    if (pendingOp && pendingOp.timestamp > event.timestamp) {
      // Our pending operation is newer, ignore this event
      return false;
    }

    // For timer control events, only accept from current leader
    if (["START", "PAUSE", "RESET"].includes(event.type)) {
      // This check will be enhanced in the leader integration
      return true;
    }

    return true;
  }

  private notifyCallbacks(event: TimerSyncEvent) {
    this.callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        // Error in sync callback - skip detailed logging to prevent spam
      }
    });
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      if (!OBR.isAvailable) {
        return "dev-player";
      }

      const player = await OBR.player.getId();
      return player;
    } catch (error) {
      // Failed to get user ID - use fallback
      return "unknown";
    }
  }

  private queueMessage(event: string, data: any) {
    this.messageQueue.push({ event, data });

    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > 50) {
      this.messageQueue.shift();
    }
  }

  private async retryOperation(operation: () => Promise<any>): Promise<any> {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxRetries) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = Math.min(
          1000 * Math.pow(2, attempt - 1) + Math.random() * 500,
          10000,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Retry queued messages when connection is restored
  async retryQueuedMessages() {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    // Retry queued messages

    for (const { event, data } of messages) {
      try {
        await this.broadcastMessage(event, data);
      } catch (error) {
        // Failed to retry message
        // Re-queue if it still fails
        this.queueMessage(event, data);
      }
    }
  }

  // Add pending operation for conflict resolution
  addPendingOperation(timerId: string, operation: any) {
    this.pendingOperations.set(timerId, operation);

    // Clean up old pending operations
    setTimeout(() => {
      this.pendingOperations.delete(timerId);
    }, 10000); // Keep for 10 seconds
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isSetup: this.isSetup,
      queueSize: this.messageQueue.length,
      retryAttempts: this.retryAttempts,
    };
  }

  // Cleanup method
  destroy() {
    this.callbacks.clear();
    this.messageQueue = [];
    this.pendingOperations.clear();
  }
}

export const timerSyncService = TimerSyncService.getInstance();
export default timerSyncService;
