import { EXTENSION_ID } from '../types';
import OBR from '@owlbear-rodeo/sdk';

class ContextMenuService {
  private isInitialized = false;
  private isActionOpen = false;
  private unsubscribeOpenChange?: () => void;

  async initialize() {
    if (this.isInitialized) return;

    try {
      if (!OBR.isAvailable) {
        this.isInitialized = true;
        return;
      }

      this.unsubscribeOpenChange = OBR.action.onOpenChange((isOpen) => {
        this.isActionOpen = isOpen;
        this.updateGlobalMenu();
      });

      await this.setupContextMenu();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize context menu service:', error);
    }
  }

  private async setupContextMenu() {
    if (!OBR) return;

    // Create main timer context menu
    OBR.contextMenu.create({
      id: `${EXTENSION_ID}/timer-menu`,
      icons: [
        {
          icon: '/start-timer.svg',
          label: 'Start Timer',
          filter: {
            every: [
              { key: 'layer', value: 'CHARACTER' },
              { key: ['metadata', `${EXTENSION_ID}/hasTimer`], value: true },
            ],
          },
        },
        {
          icon: '/pause-timer.svg',
          label: 'Pause Timer',
          filter: {
            every: [
              { key: 'layer', value: 'CHARACTER' },
              { key: ['metadata', `${EXTENSION_ID}/hasTimer`], value: true },
              { key: ['metadata', `${EXTENSION_ID}/isRunning`], value: true },
            ],
          },
        },
        {
          icon: '/reset-timer.svg',
          label: 'Reset Timer',
          filter: {
            every: [
              { key: 'layer', value: 'CHARACTER' },
              { key: ['metadata', `${EXTENSION_ID}/hasTimer`], value: true },
            ],
          },
        },
        {
          icon: '/add-timer.svg',
          label: 'Add Timer to Item',
          filter: {
            every: [
              { key: 'layer', value: 'CHARACTER' },
              { key: ['metadata', `${EXTENSION_ID}/hasTimer`], value: false },
            ],
          },
        },
        {
          icon: '/remove-timer.svg',
          label: 'Remove Timer',
          filter: {
            every: [
              { key: 'layer', value: 'CHARACTER' },
              { key: ['metadata', `${EXTENSION_ID}/hasTimer`], value: true },
            ],
          },
        },
      ],
      onClick: async (context: any) => {
        await this.handleContextMenuClick(context);
      },
    });

    // Create global timer menu (always visible)
    await this.updateGlobalMenu();
  }

  private async updateGlobalMenu() {
    OBR.contextMenu.create({
      id: `${EXTENSION_ID}/global-timer`,
      icons: [
        {
          icon: '/timer-icon.svg',
          label: this.isActionOpen ? 'Close Dark Torch' : 'Open Dark Torch',
          filter: {
            // No filter - always visible
          },
        },
      ],
      onClick: async () => {
        const isOpen = await OBR.action.isOpen();
        if (isOpen) {
          await OBR.action.close();
        } else {
          await OBR.action.open();
        }
      },
    });
  }

  private async handleContextMenuClick(context: any) {
    const action =
      context.items[0]?.metadata?.[`${EXTENSION_ID}/action`] ||
      context.items[0]?.label?.toLowerCase().includes('start')
        ? 'start'
        : context.items[0]?.label?.toLowerCase().includes('pause')
          ? 'pause'
          : context.items[0]?.label?.toLowerCase().includes('reset')
            ? 'reset'
            : context.items[0]?.label?.toLowerCase().includes('add')
              ? 'add'
              : context.items[0]?.label?.toLowerCase().includes('remove')
                ? 'remove'
                : null;

    if (!action) {
      console.warn('Unknown context menu action');
      return;
    }

    const selectedItems = context.items;

    switch (action) {
      case 'start':
        await this.startTimerForItems(selectedItems);
        break;
      case 'pause':
        await this.pauseTimerForItems(selectedItems);
        break;
      case 'reset':
        await this.resetTimerForItems(selectedItems);
        break;
      case 'add':
        await this.addTimerToItems(selectedItems);
        break;
      case 'remove':
        await this.removeTimerFromItems(selectedItems);
        break;
    }
  }

  private async startTimerForItems(items: any[]) {
    try {
      await OBR.scene.items.updateItems(items, (item: any) => {
        item.metadata[`${EXTENSION_ID}/isRunning`] = true;
        item.metadata[`${EXTENSION_ID}/lastStarted`] = Date.now();
      });

      // Broadcast timer start event
      await OBR.broadcast.sendMessage(`${EXTENSION_ID}/timer-start`, {
        itemIds: items.map(item => item.id),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to start timer for items:', error);
    }
  }

  private async pauseTimerForItems(items: any[]) {
    try {
      await OBR.scene.items.updateItems(items, (item: any) => {
        item.metadata[`${EXTENSION_ID}/isRunning`] = false;
        item.metadata[`${EXTENSION_ID}/lastPaused`] = Date.now();
      });

      // Broadcast timer pause event
      await OBR.broadcast.sendMessage(`${EXTENSION_ID}/timer-pause`, {
        itemIds: items.map(item => item.id),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to pause timer for items:', error);
    }
  }

  private async resetTimerForItems(items: any[]) {
    try {
      await OBR.scene.items.updateItems(items, (item: any) => {
        item.metadata[`${EXTENSION_ID}/isRunning`] = false;
        item.metadata[`${EXTENSION_ID}/remaining`] = 3600; // Reset to 1 hour
        item.metadata[`${EXTENSION_ID}/lastReset`] = Date.now();
      });

      // Broadcast timer reset event
      await OBR.broadcast.sendMessage(`${EXTENSION_ID}/timer-reset`, {
        itemIds: items.map(item => item.id),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to reset timer for items:', error);
    }
  }

  private async addTimerToItems(items: any[]) {
    try {
      await OBR.scene.items.updateItems(items, (item: any) => {
        item.metadata[`${EXTENSION_ID}/hasTimer`] = true;
        item.metadata[`${EXTENSION_ID}/isRunning`] = false;
        item.metadata[`${EXTENSION_ID}/remaining`] = 3600; // 1 hour default
        item.metadata[`${EXTENSION_ID}/created`] = Date.now();
      });

      // Broadcast timer addition event
      await OBR.broadcast.sendMessage(`${EXTENSION_ID}/timer-added`, {
        itemIds: items.map(item => item.id),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to add timer to items:', error);
    }
  }

  private async removeTimerFromItems(items: any[]) {
    try {
      await OBR.scene.items.updateItems(items, (item: any) => {
        // Remove all timer-related metadata
        Object.keys(item.metadata).forEach(key => {
          if (key.startsWith(`${EXTENSION_ID}/`)) {
            delete item.metadata[key];
          }
        });
      });

      // Broadcast timer removal event
      await OBR.broadcast.sendMessage(`${EXTENSION_ID}/timer-removed`, {
        itemIds: items.map(item => item.id),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to remove timer from items:', error);
    }
  }

  // Get all items with timers
  async getTimerItems() {
    try {
      if (!OBR) return [];

      const items = await OBR.scene.items.getItems();
      return items.filter(
        (item: any) => item.metadata[`${EXTENSION_ID}/hasTimer`]
      );
    } catch (error) {
      console.error('Failed to get timer items:', error);
      return [];
    }
  }

  // Update timer state for specific items
  async updateTimerStates(
    timerUpdates: Array<{
      itemId: string;
      remaining: number;
      isRunning: boolean;
    }>
  ) {
    try {
      if (!OBR) return;

      const itemIds = timerUpdates.map(update => update.itemId);
      const items = await OBR.scene.items.getItems(itemIds);

      await OBR.scene.items.updateItems(items, (item: any) => {
        const update = timerUpdates.find(u => u.itemId === item.id);
        if (update) {
          item.metadata[`${EXTENSION_ID}/remaining`] = update.remaining;
          item.metadata[`${EXTENSION_ID}/isRunning`] = update.isRunning;
          item.metadata[`${EXTENSION_ID}/lastUpdated`] = Date.now();
        }
      });
    } catch (error) {
      console.error('Failed to update timer states:', error);
    }
  }

  // Cleanup method
  destroy() {
    this.unsubscribeOpenChange?.();
    this.isInitialized = false;
  }
}

export const contextMenuService = new ContextMenuService();
export default contextMenuService;
