import { create } from "zustand";
import type { TimerStore } from "../types";

const DEFAULT_DURATION = 3600; // 60 minutes in seconds
const MAX_DURATION_SECONDS = 999 * 60; // 999 minutes
const MIN_DURATION_SECONDS = 60; // 1 minute

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  duration: DEFAULT_DURATION,
  remaining: DEFAULT_DURATION,
  isRunning: false,
  soundEnabled: true,
  isCompleted: false,
  incrementAmount: 300, // Default 5 minutes
  displayMode: "hourglass",
  visibilityMode: "EVERYONE",

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
    const { duration } = get();
    set({
      remaining: duration,
      isRunning: false,
      isCompleted: false,
    });
  },

  setTime: (seconds: number) => {
    const { duration } = get();
    const clampedSeconds = Math.max(0, Math.min(seconds, duration));
    set({
      remaining: clampedSeconds,
      isRunning: clampedSeconds > 0 && get().isRunning,
      isCompleted: clampedSeconds === 0,
    });
  },

  setDuration: (seconds: number) => {
    const clamped = Math.max(
      MIN_DURATION_SECONDS,
      Math.min(seconds, MAX_DURATION_SECONDS),
    );
    const state = get();
    const remaining = Math.min(state.remaining, clamped);
    set({
      duration: clamped,
      remaining,
      isRunning: remaining > 0 && state.isRunning,
      isCompleted: remaining === 0,
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

  setDisplayMode: (mode: TimerStore["displayMode"]) => {
    set({ displayMode: mode });
  },

  setVisibilityMode: (mode: TimerStore["visibilityMode"]) => {
    set({ visibilityMode: mode });
  },
}));

// Selectors for optimized re-renders
export const useTimerRemaining = () =>
  useTimerStore((state) => state.remaining);
export const useTimerIsRunning = () =>
  useTimerStore((state) => state.isRunning);
export const useTimerSoundEnabled = () =>
  useTimerStore((state) => state.soundEnabled);
export const useTimerIsCompleted = () =>
  useTimerStore((state) => state.isCompleted);
export const useTimerIncrementAmount = () =>
  useTimerStore((state) => state.incrementAmount);
export const useTimerDisplayMode = () =>
  useTimerStore((state) => state.displayMode);
export const useTimerVisibilityMode = () =>
  useTimerStore((state) => state.visibilityMode);
export const useTimerActions = () => useTimerStore((state) => state);
