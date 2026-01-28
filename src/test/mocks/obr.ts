import { vi } from 'vitest';

type BroadcastHandler = (event: any) => void;

type OBRMock = {
  isAvailable: boolean;
  onReady: (cb: () => void) => void;
  player: {
    getId: () => Promise<string>;
    getName: () => Promise<string>;
    getRole: () => Promise<'GM' | 'PLAYER'>;
    getColor: () => Promise<string>;
    onChange: (cb: () => void) => () => void;
  };
  broadcast: {
    sendMessage: (event: string, data: any) => Promise<void>;
    onMessage: (event: string, cb: BroadcastHandler) => void;
  };
  scene: {
    isReady: () => Promise<boolean>;
    onReadyChange: (cb: (ready: boolean) => void) => () => void;
    getMetadata: () => Promise<Record<string, any>>;
    setMetadata: (metadata: Record<string, any>) => Promise<void>;
    items: {
      onChange: (cb: () => void) => () => void;
      getItems: (ids?: string[]) => Promise<any[]>;
      updateItems: (items: any[], updater: (item: any) => void) => Promise<void>;
    };
  };
  contextMenu: {
    create: (config: any) => void;
  };
};

const broadcastHandlers = new Map<string, Set<BroadcastHandler>>();

function deliverBroadcast(event: string, data: any) {
  const handlers = broadcastHandlers.get(event);
  if (!handlers) return;
  for (const handler of handlers) {
    handler({
      data,
      timestamp: Date.now(),
      userId: 'test-player',
    });
  }
}

export const OBR_MOCK: OBRMock = {
  isAvailable: false,
  onReady: (cb: () => void) => {
    // In tests, treat onReady as synchronous when available.
    cb();
  },
  player: {
    getId: vi.fn(async () => 'test-player'),
    getName: vi.fn(async () => 'Test Player'),
    getRole: vi.fn(async () => 'GM'),
    getColor: vi.fn(async () => '#ffffff'),
    onChange: vi.fn(() => () => {}),
  },
  broadcast: {
    sendMessage: vi.fn(async (event: string, data: any) => {
      deliverBroadcast(event, data);
    }),
    onMessage: vi.fn((event: string, cb: BroadcastHandler) => {
      if (!broadcastHandlers.has(event)) broadcastHandlers.set(event, new Set());
      broadcastHandlers.get(event)!.add(cb);
    }),
  },
  scene: {
    isReady: vi.fn(async () => true),
    onReadyChange: vi.fn(() => () => {}),
    getMetadata: vi.fn(async () => ({})),
    setMetadata: vi.fn(async () => {}),
    items: {
      onChange: vi.fn(() => () => {}),
      getItems: vi.fn(async () => []),
      updateItems: vi.fn(async (items: any[], updater: (item: any) => void) => {
        for (const item of items) updater(item);
      }),
    },
  },
  contextMenu: {
    create: vi.fn(() => {}),
  },
};

export function resetOBRMock() {
  // Reset mutable state and restore default mock behavior.
  OBR_MOCK.isAvailable = false;
  broadcastHandlers.clear();

  OBR_MOCK.player.getId.mockReset();
  OBR_MOCK.player.getId.mockResolvedValue('test-player');
  OBR_MOCK.player.getName.mockReset();
  OBR_MOCK.player.getName.mockResolvedValue('Test Player');
  OBR_MOCK.player.getRole.mockReset();
  OBR_MOCK.player.getRole.mockResolvedValue('GM');
  OBR_MOCK.player.getColor.mockReset();
  OBR_MOCK.player.getColor.mockResolvedValue('#ffffff');
  OBR_MOCK.player.onChange.mockReset();
  OBR_MOCK.player.onChange.mockReturnValue(() => {});

  OBR_MOCK.broadcast.sendMessage.mockReset();
  OBR_MOCK.broadcast.sendMessage.mockImplementation(async (event: string, data: any) => {
    deliverBroadcast(event, data);
  });
  OBR_MOCK.broadcast.onMessage.mockReset();
  OBR_MOCK.broadcast.onMessage.mockImplementation((event: string, cb: BroadcastHandler) => {
    if (!broadcastHandlers.has(event)) broadcastHandlers.set(event, new Set());
    broadcastHandlers.get(event)!.add(cb);
  });

  OBR_MOCK.scene.isReady.mockReset();
  OBR_MOCK.scene.isReady.mockResolvedValue(true);
  OBR_MOCK.scene.onReadyChange.mockReset();
  OBR_MOCK.scene.onReadyChange.mockReturnValue(() => {});
  OBR_MOCK.scene.getMetadata.mockReset();
  OBR_MOCK.scene.getMetadata.mockResolvedValue({});
  OBR_MOCK.scene.setMetadata.mockReset();
  OBR_MOCK.scene.setMetadata.mockResolvedValue();
  OBR_MOCK.scene.items.onChange.mockReset();
  OBR_MOCK.scene.items.onChange.mockReturnValue(() => {});
  OBR_MOCK.scene.items.getItems.mockReset();
  OBR_MOCK.scene.items.getItems.mockResolvedValue([]);
  OBR_MOCK.scene.items.updateItems.mockReset();
  OBR_MOCK.scene.items.updateItems.mockImplementation(async (items: any[], updater: (item: any) => void) => {
    for (const item of items) updater(item);
  });

  OBR_MOCK.contextMenu.create.mockReset();
}

export function setOBRAvailable(isAvailable: boolean) {
  OBR_MOCK.isAvailable = isAvailable;
}

export function setWindowOBRReady(isReady: boolean) {
  (window as any).OBR = {
    ...(window as any).OBR,
    isReady,
    broadcast: {
      sendMessage: OBR_MOCK.broadcast.sendMessage,
      onMessage: OBR_MOCK.broadcast.onMessage,
    },
  };
}

