import { create } from 'zustand';
import type { TimerStore } from '../types';

const DEFAULT_DURATION = 3600; // 60 minutes in seconds

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  duration: DEFAULT_DURATION,
  remaining: DEFAULT_DURATION,
  isRunning: false,
  soundEnabled: true,
  isCompleted: false,
  incrementAmount: 300, // Default 5 minutes
  displayMode: 'hourglass',
  visibilityMode: 'EVERYONE',

  // Actions
  start: () => {
    const { remaining } = get();
    if (remaining > 0) {
      set({ isRunning: true, isCompleted: false });
    }
  },

  pause: () => {
    set({ isRunning: false });
  },

  reset: () => {
    set({
      remaining: DEFAULT_DURATION,
      isRunning: false,
      isCompleted: false,
    });
  },

  setTime: (seconds: number) => {
    const clampedSeconds = Math.max(0, Math.min(seconds, DEFAULT_DURATION));
    set({
      remaining: clampedSeconds,
      isRunning: clampedSeconds > 0 && get().isRunning,
      isCompleted: clampedSeconds === 0,
    });
  },

  complete: () => {
    set({
      remaining: 0,
      isRunning: false,
      isCompleted: true,
    });
  },

  toggleSound: () => {
    set({ soundEnabled: !get().soundEnabled });
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
  },

  setIncrementAmount: (seconds: number) => {
    set({ incrementAmount: seconds });
  },

  setDisplayMode: (mode: TimerStore['displayMode']) => {
    set({ displayMode: mode });
  },

  setVisibilityMode: (mode: TimerStore['visibilityMode']) => {
    set({ visibilityMode: mode });
  },
}));

// Selectors for optimized re-renders
export const useTimerRemaining = () => useTimerStore(state => state.remaining);
export const useTimerIsRunning = () => useTimerStore(state => state.isRunning);
export const useTimerSoundEnabled = () =>
  useTimerStore(state => state.soundEnabled);
export const useTimerIsCompleted = () =>
  useTimerStore(state => state.isCompleted);
export const useTimerIncrementAmount = () =>
  useTimerStore(state => state.incrementAmount);
export const useTimerDisplayMode = () =>
  useTimerStore(state => state.displayMode);
export const useTimerVisibilityMode = () =>
  useTimerStore(state => state.visibilityMode);
export const useTimerActions = () => useTimerStore(state => state);
