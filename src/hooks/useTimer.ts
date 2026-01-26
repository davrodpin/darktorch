import { useEffect, useRef } from 'react';
import { useTimerStore } from '../store/timerStore';

/**
 * Custom hook for managing the countdown timer logic
 * Handles interval creation/cleanup and timer updates
 */
export const useTimer = () => {
  const { remaining, isRunning, setTime } = useTimerStore();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Start new interval if timer is running
    if (isRunning && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        const currentRemaining = useTimerStore.getState().remaining;
        if (currentRemaining > 0) {
          useTimerStore.getState().setTime(currentRemaining - 1);
        }
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, remaining, setTime]);

  // Handle timer completion
  useEffect(() => {
    if (remaining === 0 && isRunning) {
      const { pause, complete } = useTimerStore.getState();
      pause();
      complete();
    }
  }, [remaining, isRunning]);
};
