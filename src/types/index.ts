export interface TimerState {
  duration: number; // Total duration in seconds (3600 = 1 hour)
  remaining: number; // Remaining time in seconds
  isRunning: boolean; // Timer running status
  soundEnabled: boolean; // Whether sound notifications are enabled
  isCompleted: boolean; // Whether timer has completed
  incrementAmount: number; // Amount in seconds for +/- buttons (default: 300 = 5 min)
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
  complete: () => void; // Called when timer reaches zero
  toggleSound: () => void; // Toggle sound notifications
  setSoundEnabled: (enabled: boolean) => void; // Set sound enabled state
  setIncrementAmount: (seconds: number) => void; // Set increment/decrement amount
}

export interface TimerStore extends TimerState, TimerActions {}

export interface TimeDisplay {
  formatted: string; // "MM:SS" formatted string
  minutes: number; // Minutes portion
  seconds: number; // Seconds portion
  totalSeconds: number; // Total seconds
  isLowTime: boolean; // True when less than 10 minutes
  isExpired: boolean; // True when timer has reached zero
}
