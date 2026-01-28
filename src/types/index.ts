export interface TimerState {
  duration: number; // Total duration in seconds (3600 = 1 hour)
  remaining: number; // Remaining time in seconds
  isRunning: boolean; // Timer running status
  soundEnabled: boolean; // Whether sound notifications are enabled
  isCompleted: boolean; // Whether timer has completed
  incrementAmount: number; // Amount in seconds for +/- buttons (default: 300 = 5 min)
  displayMode: 'number' | 'hourglass'; // Display mode for the timer
  visibilityMode: 'EVERYONE' | 'GM_ONLY'; // Who can see the timer display
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
  setDisplayMode: (mode: TimerState['displayMode']) => void; // Set numeric/hourglass display
  setVisibilityMode: (mode: TimerState['visibilityMode']) => void; // Set who can see the timer
}

export interface TimerStore extends TimerState, TimerActions {}

export interface TimeDisplay {
  formatted: string; // "MM:SS" formatted string
  minutes: number; // Minutes portion
  seconds: number; // Seconds portion
  totalSeconds: number; // Total seconds
  isLowTime: boolean; // True when less than 15 minutes
  isCriticalTime: boolean; // True when less than 5 minutes
  isExpired: boolean; // True when timer has reached zero
}

// Owlbear Rodeo integration types
export interface PlayerRole {
  id: string;
  name: string;
  role: 'GM' | 'PLAYER';
  color: string;
}

export interface TimerSyncState extends TimerState {
  id: string;
  version: number;
  lastModified: number;
  lastModifiedBy: string;
  isLeader: boolean;
  leaderId?: string;
  lastSaved?: number;
  duration: number; // Add missing duration property
}

export interface TimerSyncEvent {
  type: 'START' | 'PAUSE' | 'RESET' | 'UPDATE' | 'SYNC' | 'LEADER_CHANGE';
  timerId: string;
  payload: any;
  timestamp: number;
  userId: string;
}

export interface LeaderState {
  isLeader: boolean;
  leaderId?: string;
  heartbeatInterval?: ReturnType<typeof setInterval>;
}

export interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnected: number;
  reconnectAttempts: number;
}

// Extension metadata constants
export const EXTENSION_ID = 'com.github.davrodpin.darktorch';

// Broadcast event constants
export const TIMER_EVENTS = {
  START: `${EXTENSION_ID}/timer-start`,
  PAUSE: `${EXTENSION_ID}/timer-pause`,
  RESET: `${EXTENSION_ID}/timer-reset`,
  UPDATE: `${EXTENSION_ID}/timer-update`,
  SYNC: `${EXTENSION_ID}/timer-sync`,
  LEADER_HEARTBEAT: `${EXTENSION_ID}/leader-heartbeat`,
  LEADER_ELECTION: `${EXTENSION_ID}/leader-election`,
} as const;
