import { useEffect, useCallback } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useTimerIsCompleted, useTimerSoundEnabled } from '../store/timerStore';
import { initAudio, playTimerCompleteSound, playTickSound } from '../utils/sound';

/**
 * Hook to handle timer sound notifications
 * Initializes audio on first user interaction and plays sounds based on timer events
 */
export const useSoundNotifications = () => {
  const soundEnabled = useTimerSoundEnabled();
  const isCompleted = useTimerIsCompleted();
  const { toggleSound, setSoundEnabled } = useTimerStore();

  // Initialize audio context on first user interaction
  const initAudioOnUserInteraction = useCallback(() => {
    initAudio();
  }, []);

  // Play completion sound when timer finishes
  useEffect(() => {
    if (isCompleted && soundEnabled) {
      playTimerCompleteSound();
    }
  }, [isCompleted, soundEnabled]);

  // Play tick sound for time adjustments
  const playAdjustmentSound = useCallback((isUp: boolean) => {
    if (soundEnabled) {
      playTickSound(isUp);
    }
  }, [soundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    setSoundEnabled,
    initAudioOnUserInteraction,
    playAdjustmentSound,
  };
};