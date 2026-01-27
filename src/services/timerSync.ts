import {
  TIMER_EVENTS,
  type TimerSyncState,
  type TimerSyncEvent,
} from '../types';
import { safeAsyncOperation } from '../utils/errorHandling';
import OBR from '@owlbear-rodeo/sdk';

class TimerSyncService {
  private static instance: TimerSyncService;
  private callbacks: Set<(event: TimerSyncEvent) => void> = new Set();
  private messageQueue: Array<{ event: string; data: any }> = [];
  private isConnected = false;
  private retryAttempts = 0;
  private maxRetries = 3;
  private pendingOperations = new Map<string, any>();
  private isSetup = false;

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
          type: 'START',
          timerId: timerState.id || 'default',
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.START, event);
      },
      undefined,
      undefined
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
          type: 'PAUSE',
          timerId: timerState.id || 'default',
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.PAUSE, event);
      },
      undefined,
      undefined
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
          type: 'RESET',
          timerId: timerState.id || 'default',
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.RESET, event);
      },
      undefined,
      undefined
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
          type: 'UPDATE',
          timerId: timerState.id || 'default',
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.UPDATE, event);
      },
      undefined,
      undefined
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
          type: 'SYNC',
          timerId: timerState.id,
          payload,
          timestamp: Date.now(),
          userId: await this.getCurrentUserId(),
        };

        await this.broadcastMessage(TIMER_EVENTS.SYNC, event);
      },
      undefined,
      undefined
    );
  }

  // Request full sync from current leader
  async requestFullSync() {
    const event: TimerSyncEvent = {
      type: 'SYNC',
      timerId: 'default',
      payload: {
        requestFullSync: true,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: await this.getCurrentUserId(),
    };

    await this.broadcastMessage(TIMER_EVENTS.SYNC, event);
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
      // Log broadcast errors at reduced frequency
      if (this.retryAttempts === 0) {
        console.error(
          `Broadcast ${event} failed:`,
          error instanceof Error ? error.message : String(error)
        );
      }

      // Queue the message for retry
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
        const syncEvent: TimerSyncEvent = {
          type: 'START',
          timerId: event.data.timerId,
          payload: event.data,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.PAUSE, (event: any) => {
        const syncEvent: TimerSyncEvent = {
          type: 'PAUSE',
          timerId: event.data.timerId,
          payload: event.data,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.RESET, (event: any) => {
        const syncEvent: TimerSyncEvent = {
          type: 'RESET',
          timerId: event.data.timerId,
          payload: event.data,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.UPDATE, (event: any) => {
        const syncEvent: TimerSyncEvent = {
          type: 'UPDATE',
          timerId: event.data.timerId,
          payload: event.data,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });

      OBR.broadcast.onMessage(TIMER_EVENTS.SYNC, (event: any) => {
        const syncEvent: TimerSyncEvent = {
          type: 'SYNC',
          timerId: event.data.timerId,
          payload: event.data,
          timestamp: event.timestamp,
          userId: event.userId,
        };
        this.handleSyncEvent(syncEvent);
      });
    } catch (error) {
      console.error('Failed to setup sync event listeners:', error);
    }
  }

  private handleSyncEvent(event: TimerSyncEvent) {
    // Ignore events from ourselves to prevent echo
    this.getCurrentUserId().then(currentUserId => {
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
    if (['START', 'PAUSE', 'RESET'].includes(event.type)) {
      // This check will be enhanced in the leader integration
      return true;
    }

    return true;
  }

  private notifyCallbacks(event: TimerSyncEvent) {
    this.callbacks.forEach(callback => {
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
        return 'dev-player';
      }

      const player = await OBR.player.getId();
      return player;
    } catch (error) {
      // Failed to get user ID - use fallback
      return 'unknown';
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
          10000
        );
        await new Promise(resolve => setTimeout(resolve, delay));
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
