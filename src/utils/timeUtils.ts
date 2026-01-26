import type { TimeDisplay } from '../types';

/**
 * Formats seconds into MM:SS string format
 * @param seconds - Number of seconds to format
 * @returns Formatted time string (e.g., "60:00", "05:30")
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

/**
 * Creates a comprehensive time display object from seconds
 * @param seconds - Number of seconds
 * @param isExpired - Whether the timer has expired (optional)
 * @returns TimeDisplay object with formatted components
 */
export const createTimeDisplay = (seconds: number, isExpired: boolean = false): TimeDisplay => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const isLowTime = seconds < 600 && seconds > 0; // Less than 10 minutes but not zero
  const isExpiredFinal = isExpired || seconds === 0;

  return {
    formatted: formatTime(seconds),
    minutes,
    seconds: remainingSeconds,
    totalSeconds: seconds,
    isLowTime,
    isExpired: isExpiredFinal,
  };
};

/**
 * Parses a MM:SS string back into seconds
 * @param timeString - Time string in "MM:SS" format
 * @returns Number of seconds, or 0 if invalid format
 */
export const parseTime = (timeString: string): number => {
  const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  if (minutes < 0 || seconds < 0 || seconds >= 60) return 0;

  return minutes * 60 + seconds;
};

/**
 * Calculates the percentage of time remaining
 * @param remaining - Remaining time in seconds
 * @param total - Total duration in seconds
 * @returns Percentage (0-100)
 */
export const calculateProgress = (remaining: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (remaining / total) * 100));
};
