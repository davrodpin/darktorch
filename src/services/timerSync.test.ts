import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OBR_MOCK, resetOBRMock, setOBRAvailable } from '../test/mocks/obr';

describe('timerSyncService', () => {
  beforeEach(() => {
    resetOBRMock();
    vi.resetModules();
  });

  it('echoes events to local subscribers in dev mode (OBR unavailable)', async () => {
    setOBRAvailable(false);
    const timerSyncService = (await import('./timerSync')).default;

    const received: any[] = [];
    timerSyncService.onSyncEvent((event) => received.push(event));

    await timerSyncService.broadcastTimerStart({ id: 'default', remaining: 10 });

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('START');
    expect(received[0].timerId).toBe('default');
  });

  it('caps the queued message buffer at 50 when broadcasts fail', async () => {
    setOBRAvailable(true);
    const timerSyncService = (await import('./timerSync')).default;

    // Avoid exponential backoff delays in tests.
    (timerSyncService as any).maxRetries = 1;

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    OBR_MOCK.broadcast.sendMessage.mockRejectedValue(new Error('send failed'));

    for (let i = 0; i < 60; i++) {
      await timerSyncService.broadcastTimerUpdate({ id: 'default', remaining: i });
    }

    const status = timerSyncService.getConnectionStatus();
    expect(status.isConnected).toBe(false);
    expect(status.queueSize).toBe(50);

    consoleError.mockRestore();
  });
});

