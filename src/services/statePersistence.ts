import { EXTENSION_ID, type TimerSyncState } from '../types';
import OBR from '@owlbear-rodeo/sdk';

class StatePersistenceService {
  private static instance: StatePersistenceService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): StatePersistenceService {
    if (!StatePersistenceService.instance) {
      StatePersistenceService.instance = new StatePersistenceService();
    }
    return StatePersistenceService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      if (!OBR.isAvailable) {
        this.isInitialized = true;
        return;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize state persistence service:', error);
    }
  }

  // Save timer state to scene metadata
  async saveTimerState(timerState: TimerSyncState): Promise<void> {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        localStorage.setItem(
          `${EXTENSION_ID}/timer-state`,
          JSON.stringify(timerState)
        );
        return;
      }

      // Save to scene metadata
      await OBR.scene.setMetadata({
        [`${EXTENSION_ID}/timer-state`]: timerState,
        [`${EXTENSION_ID}/last-saved`]: Date.now(),
        [`${EXTENSION_ID}/version`]: timerState.version,
      });

      console.log('Timer state saved to scene metadata');
    } catch (error) {
      console.error('Failed to save timer state:', error);
      throw error;
    }
  }

  // Load timer state from scene metadata
  async loadTimerState(): Promise<TimerSyncState | null> {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        const saved = localStorage.getItem(`${EXTENSION_ID}/timer-state`);
        return saved ? JSON.parse(saved) : null;
      }

      const metadata = await OBR.scene.getMetadata();
      const timerState = metadata[`${EXTENSION_ID}/timer-state`];

      if (timerState) {
        console.log('Timer state loaded from scene metadata');
        return timerState as TimerSyncState;
      }

      return null;
    } catch (error) {
      console.error('Failed to load timer state:', error);
      return null;
    }
  }

  // Save timer state to a specific item
  async saveTimerStateToItem(
    itemId: string,
    timerState: TimerSyncState
  ): Promise<void> {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        const itemStates = JSON.parse(
          localStorage.getItem(`${EXTENSION_ID}/item-timers`) || '{}'
        );
        itemStates[itemId] = timerState;
        localStorage.setItem(
          `${EXTENSION_ID}/item-timers`,
          JSON.stringify(itemStates)
        );
        return;
      }

      const items = await OBR.scene.items.getItems([itemId]);
      if (items.length === 0) {
        throw new Error(`Item ${itemId} not found`);
      }

      await OBR.scene.items.updateItems(items, (item: any) => {
        item.metadata[`${EXTENSION_ID}/timer-state`] = timerState;
        item.metadata[`${EXTENSION_ID}/last-saved`] = Date.now();
        item.metadata[`${EXTENSION_ID}/version`] = timerState.version;
      });

      console.log(`Timer state saved to item ${itemId}`);
    } catch (error) {
      console.error(`Failed to save timer state to item ${itemId}:`, error);
      throw error;
    }
  }

  // Load timer state from a specific item
  async loadTimerStateFromItem(itemId: string): Promise<TimerSyncState | null> {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        const itemStates = JSON.parse(
          localStorage.getItem(`${EXTENSION_ID}/item-timers`) || '{}'
        );
        return itemStates[itemId] || null;
      }

      const items = await OBR.scene.items.getItems([itemId]);
      if (items.length === 0) {
        return null;
      }

      const item = items[0];
      const timerState = item.metadata[`${EXTENSION_ID}/timer-state`];

      if (timerState) {
        console.log(`Timer state loaded from item ${itemId}`);
        return timerState as TimerSyncState;
      }

      return null;
    } catch (error) {
      console.error(`Failed to load timer state from item ${itemId}:`, error);
      return null;
    }
  }

  // Get all items with timer states
  async getAllTimerItems(): Promise<
    Array<{ itemId: string; timerState: TimerSyncState }>
  > {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        const itemStates = JSON.parse(
          localStorage.getItem(`${EXTENSION_ID}/item-timers`) || '{}'
        );
        return Object.entries(itemStates).map(([itemId, timerState]) => ({
          itemId,
          timerState: timerState as TimerSyncState,
        }));
      }

      const items = await OBR.scene.items.getItems();
      const timerItems = items
        .filter((item: any) => item.metadata[`${EXTENSION_ID}/timer-state`])
        .map((item: any) => ({
          itemId: item.id,
          timerState: item.metadata[
            `${EXTENSION_ID}/timer-state`
          ] as TimerSyncState,
        }));

      return timerItems;
    } catch (error) {
      console.error('Failed to get all timer items:', error);
      return [];
    }
  }

  // Remove timer state from a specific item
  async removeTimerStateFromItem(itemId: string): Promise<void> {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        const itemStates = JSON.parse(
          localStorage.getItem(`${EXTENSION_ID}/item-timers`) || '{}'
        );
        delete itemStates[itemId];
        localStorage.setItem(
          `${EXTENSION_ID}/item-timers`,
          JSON.stringify(itemStates)
        );
        return;
      }

      const items = await OBR.scene.items.getItems([itemId]);
      if (items.length === 0) {
        return;
      }

      await OBR.scene.items.updateItems(items, (item: any) => {
        // Remove all timer-related metadata
        Object.keys(item.metadata).forEach(key => {
          if (key.startsWith(`${EXTENSION_ID}/`)) {
            delete item.metadata[key];
          }
        });
      });

      console.log(`Timer state removed from item ${itemId}`);
    } catch (error) {
      console.error(`Failed to remove timer state from item ${itemId}:`, error);
      throw error;
    }
  }

  // Clean up expired timer states
  async cleanupExpiredStates(): Promise<void> {
    try {
      const timerItems = await this.getAllTimerItems();
      const now = Date.now();
      const expiredThreshold = 24 * 60 * 60 * 1000; // 24 hours

      for (const { itemId, timerState } of timerItems) {
        const lastSaved = timerState.lastModified || timerState.lastSaved || 0;
        const age = now - lastSaved;

        // Remove states older than 24 hours that are completed
        if (
          age > expiredThreshold &&
          timerState.remaining === 0 &&
          timerState.isCompleted
        ) {
          await this.removeTimerStateFromItem(itemId);
          console.log(`Cleaned up expired timer state for item ${itemId}`);
        }
      }

      // Also clean up scene-level timer state if it's expired
      const sceneTimerState = await this.loadTimerState();
      if (sceneTimerState) {
        const lastSaved =
          sceneTimerState.lastModified || sceneTimerState.lastSaved || 0;
        const age = now - lastSaved;

        if (
          age > expiredThreshold &&
          sceneTimerState.remaining === 0 &&
          sceneTimerState.isCompleted
        ) {
          await this.clearSceneTimerState();
          console.log('Cleaned up expired scene timer state');
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired states:', error);
    }
  }

  // Clear scene-level timer state
  async clearSceneTimerState(): Promise<void> {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        localStorage.removeItem(`${EXTENSION_ID}/timer-state`);
        return;
      }

      const metadata = await OBR.scene.getMetadata();
      const newMetadata = { ...metadata };

      // Remove all timer-related metadata from scene
      Object.keys(newMetadata).forEach(key => {
        if (key.startsWith(`${EXTENSION_ID}/`)) {
          delete newMetadata[key];
        }
      });

      await OBR.scene.setMetadata(newMetadata);
      console.log('Scene timer state cleared');
    } catch (error) {
      console.error('Failed to clear scene timer state:', error);
      throw error;
    }
  }

  // Get metadata version for conflict resolution
  async getMetadataVersion(target: 'scene' | string): Promise<number> {
    try {
      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        if (target === 'scene') {
          const saved = localStorage.getItem(`${EXTENSION_ID}/timer-state`);
          return saved ? JSON.parse(saved).version || 0 : 0;
        } else {
          const itemStates = JSON.parse(
            localStorage.getItem(`${EXTENSION_ID}/item-timers`) || '{}'
          );
          return itemStates[target]?.version || 0;
        }
      }

      if (target === 'scene') {
        const metadata = await OBR.scene.getMetadata();
        return Number(metadata[`${EXTENSION_ID}/version`]) || 0;
      } else {
        const items = await OBR.scene.items.getItems([target]);
        if (items.length === 0) return 0;
        return Number(items[0].metadata[`${EXTENSION_ID}/version`]) || 0;
      }
    } catch (error) {
      console.error('Failed to get metadata version:', error);
      return 0;
    }
  }

  // Backup current state before major changes
  async createBackup(backupName?: string): Promise<string> {
    const timestamp = Date.now();
    const backupId = backupName || `backup-${timestamp}`;

    try {
      const sceneState = await this.loadTimerState();
      const itemStates = await this.getAllTimerItems();

      const backup = {
        id: backupId,
        timestamp,
        sceneState,
        itemStates,
      };

      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        const backups = JSON.parse(
          localStorage.getItem(`${EXTENSION_ID}/backups`) || '{}'
        );
        backups[backupId] = backup;
        localStorage.setItem(
          `${EXTENSION_ID}/backups`,
          JSON.stringify(backups)
        );
      } else {
        // In Owlbear Rodeo, we could save to a separate scene metadata field
        const metadata = await OBR.scene.getMetadata();
        const backups = (metadata[`${EXTENSION_ID}/backups`] as any) || {};
        backups[backupId] = backup;
        await OBR.scene.setMetadata({
          ...metadata,
          [`${EXTENSION_ID}/backups`]: backups,
        });
      }

      // Backup created
      return backupId;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  // Restore state from backup
  async restoreBackup(backupId: string): Promise<void> {
    try {
      let backup: any;

      if (!OBR.isAvailable) {
        // Development mode - use localStorage
        const backups = JSON.parse(
          localStorage.getItem(`${EXTENSION_ID}/backups`) || '{}'
        );
        backup = backups[backupId];
      } else {
        const metadata = await OBR.scene.getMetadata();
        const backups = (metadata[`${EXTENSION_ID}/backups`] as any) || {};
        backup = backups[backupId];
      }

      if (!backup) {
        throw new Error(`Backup ${backupId} not found`);
      }

      // Restore scene state
      if (backup.sceneState) {
        await this.saveTimerState(backup.sceneState);
      }

      // Restore item states
      for (const { itemId, timerState } of backup.itemStates) {
        await this.saveTimerStateToItem(itemId, timerState);
      }

      console.log(`Restored from backup: ${backupId}`);
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  // Cleanup method
  destroy() {
    this.isInitialized = false;
  }
}

export const statePersistenceService = StatePersistenceService.getInstance();
export default statePersistenceService;
