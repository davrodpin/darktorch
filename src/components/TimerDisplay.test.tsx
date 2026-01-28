import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimerStore } from '../store/timerStore';

let mockIsGM = false;
let mockIsLeader = false;

const syncPause = vi.fn();
const syncSetTime = vi.fn();

vi.mock('../hooks/usePlayerRole', () => ({
  usePlayerRole: () => ({
    isGM: mockIsGM,
    isPlayer: !mockIsGM,
    hasPermission: (requiredRole: 'GM' | 'PLAYER' | 'ANY') => {
      if (requiredRole === 'ANY') return true;
      if (requiredRole === 'GM') return mockIsGM;
      return true;
    },
  }),
}));

vi.mock('../hooks/useTimerSync', () => ({
  useTimerSync: () => ({
    isLeader: mockIsLeader,
    syncPause,
    syncSetTime,
  }),
}));

vi.mock('../hooks/useSoundNotifications', () => ({
  useSoundNotifications: () => ({
    playAdjustmentSound: vi.fn(),
  }),
}));

import { TimerDisplay } from './TimerDisplay';

const DEFAULT_DURATION = 3600;

function resetStore() {
  useTimerStore.setState({
    duration: DEFAULT_DURATION,
    remaining: DEFAULT_DURATION,
    isRunning: false,
    soundEnabled: true,
    isCompleted: false,
    incrementAmount: 300,
    displayMode: 'number',
    visibilityMode: 'EVERYONE',
  });
}

describe('TimerDisplay', () => {
  beforeEach(() => {
    resetStore();
    mockIsGM = false;
    mockIsLeader = false;
    syncPause.mockClear();
    syncSetTime.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('hides the timer for players when visibilityMode is GM_ONLY', () => {
    mockIsGM = false;
    useTimerStore.setState({ visibilityMode: 'GM_ONLY', displayMode: 'number' });

    render(<TimerDisplay />);

    expect(screen.getByText('Hidden')).toBeInTheDocument();
    expect(screen.getByText(/Timer is hidden/i)).toBeInTheDocument();
  });

  it('does not allow editing when not (GM && leader)', () => {
    mockIsGM = true;
    mockIsLeader = false;
    useTimerStore.setState({ displayMode: 'number', visibilityMode: 'EVERYONE' });

    render(<TimerDisplay />);

    const value = screen.getByText('60:00');
    expect(value).not.toHaveAttribute('role', 'button');
    expect(value).not.toHaveAttribute('aria-label', 'Edit time');
  });

  it('enters edit mode when GM and leader clicks the time', async () => {
    const user = userEvent.setup();
    mockIsGM = true;
    mockIsLeader = true;
    useTimerStore.setState({ displayMode: 'number', visibilityMode: 'EVERYONE' });

    render(<TimerDisplay />);

    await user.click(screen.getByText('60:00'));

    expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
  });
});

