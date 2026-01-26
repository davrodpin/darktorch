export interface TimerState {
  duration: number; // Total duration in seconds (3600 = 1 hour)
  remaining: number; // Remaining time in seconds
  isRunning: boolean; // Timer running status
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
}

export interface TimerStore extends TimerState, TimerActions {}

export interface TimeDisplay {
  formatted: string; // "MM:SS" formatted string
  minutes: number; // Minutes portion
  seconds: number; // Seconds portion
  totalSeconds: number; // Total seconds
  isLowTime: boolean; // True when less than 10 minutes
}
