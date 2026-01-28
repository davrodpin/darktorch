import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimerStore } from '../store/timerStore';
import { useTimer } from './useTimer';

const DEFAULT_DURATION = 3600;

function resetStore() {
  useTimerStore.setState({
    duration: DEFAULT_DURATION,
    remaining: DEFAULT_DURATION,
    isRunning: false,
    soundEnabled: true,
    isCompleted: false,
    incrementAmount: 300,
    displayMode: 'hourglass',
    visibilityMode: 'EVERYONE',
  });
}

function TestHarness() {
  useTimer();
  return null;
}

describe('useTimer', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Ensure any mounted harnesses/effects are torn down between tests.
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('decrements remaining by 1 each second while running', () => {
    useTimerStore.setState({ remaining: 3, isRunning: true, isCompleted: false });
    const view = render(React.createElement(TestHarness));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useTimerStore.getState().remaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useTimerStore.getState().remaining).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useTimerStore.getState().remaining).toBe(0);
    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().isCompleted).toBe(true);

    view.unmount();
  });

  it('stops decrementing when paused', () => {
    useTimerStore.setState({ remaining: 3, isRunning: true });
    const view = render(React.createElement(TestHarness));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useTimerStore.getState().remaining).toBe(2);

    act(() => {
      useTimerStore.getState().pause();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(useTimerStore.getState().remaining).toBe(2);

    view.unmount();
  });

  it('cleans up interval on unmount', () => {
    useTimerStore.setState({ remaining: 3, isRunning: true });
    const view = render(React.createElement(TestHarness));

    act(() => {
      view.unmount();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(useTimerStore.getState().remaining).toBe(3);
  });
});

