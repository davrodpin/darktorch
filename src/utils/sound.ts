/**
 * Sound utility for timer notifications
 * Uses Web Audio API to generate notification sounds
 */

let audioContext: AudioContext | null = null;

/**
 * Initialize the audio context
 * Must be called after user interaction for browser compatibility
 */
export const initAudio = (): AudioContext => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

/**
 * Play a notification beep sound
 * @param frequency The frequency of the beep in Hz (default: 800)
 * @param duration The duration of the beep in milliseconds (default: 200)
 * @param volume The volume of the beep (0-1, default: 0.3)
 */
export const playBeep = (
  frequency: number = 800,
  duration: number = 200,
  volume: number = 0.3
): void => {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
};

/**
 * Play a timer completion sound (multiple beeps)
 * @param beepCount Number of beeps to play (default: 3)
 * @param interval Time between beeps in milliseconds (default: 400)
 */
export const playTimerCompleteSound = (
  beepCount: number = 3,
  interval: number = 400
): void => {
  for (let i = 0; i < beepCount; i++) {
    setTimeout(() => {
      playBeep(800 + (i * 100), 200, 0.3);
    }, i * interval);
  }
};

/**
 * Play a tick sound for time adjustments
 * @param isUp True for increasing time (higher pitch), false for decreasing (lower pitch)
 */
export const playTickSound = (isUp: boolean): void => {
  playBeep(isUp ? 600 : 400, 50, 0.2);
};

/**
 * Check if audio context is available
 */
export const isAudioSupported = (): boolean => {
  return !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
};