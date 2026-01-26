import { create } from 'zustand';
import type { TimerStore } from '../types';

const DEFAULT_DURATION = 3600; // 60 minutes in seconds

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  duration: DEFAULT_DURATION,
  remaining: DEFAULT_DURATION,
  isRunning: false,

  // Actions
  start: () => {
    const { remaining } = get();
    if (remaining > 0) {
      set({ isRunning: true });
    }
  },

  pause: () => {
    set({ isRunning: false });
  },

  reset: () => {
    set({
      remaining: DEFAULT_DURATION,
      isRunning: false,
    });
  },

  setTime: (seconds: number) => {
    const clampedSeconds = Math.max(0, Math.min(seconds, DEFAULT_DURATION));
    set({
      remaining: clampedSeconds,
      isRunning: clampedSeconds > 0 && get().isRunning,
    });
  },
}));

// Selectors for optimized re-renders
export const useTimerRemaining = () => useTimerStore(state => state.remaining);
export const useTimerIsRunning = () => useTimerStore(state => state.isRunning);
export const useTimerActions = () =>
  useTimerStore(state => ({
    start: state.start,
    pause: state.pause,
    reset: state.reset,
    setTime: state.setTime,
  }));
