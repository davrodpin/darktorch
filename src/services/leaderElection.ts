import OBR from "@owlbear-rodeo/sdk";
import { type LeaderState, TIMER_EVENTS } from "../types";

export class LeaderElectionService {
  private static instance: LeaderElectionService;
  private state: LeaderState & {
    electionTimeout?: ReturnType<typeof setTimeout>;
    heartbeatInterval?: ReturnType<typeof setInterval>;
  } = {
    isLeader: false,
    leaderId: undefined,
  };

  private callbacks: Set<(state: LeaderState) => void> = new Set();
  private heartbeatTimeouts: Map<string, ReturnType<typeof setTimeout>> =
    new Map();
  private playerId?: string;
  private isGM = false;
  private isInitialized = false;
  private initializedPlayerId?: string;
  private initializedIsGM?: boolean;
  private listenersSetup = false;

  static getInstance(): LeaderElectionService {
    if (!LeaderElectionService.instance) {
      LeaderElectionService.instance = new LeaderElectionService();
    }
    return LeaderElectionService.instance;
  }

  private isOBRReady(): boolean {
    try {
      return (
        typeof window !== "undefined" &&
        (window as any).OBR &&
        (window as any).OBR.isReady
      );
    } catch {
      return false;
    }
  }

  private notifyStateChange() {
    this.callbacks.forEach((callback) => callback(this.state));
  }

  async initialize(playerId: string, isGM: boolean) {
    // If we already initialized for this player/role, don't do it again.
    if (
      this.isInitialized &&
      this.initializedPlayerId === playerId &&
      this.initializedIsGM === isGM
    ) {
      return;
    }

    this.playerId = playerId;
    this.isGM = isGM;

    try {
      if (!OBR.isAvailable) {
        return;
      }

      if (!this.listenersSetup) {
        this.setupBroadcastListeners(OBR);
        this.listenersSetup = true;
      }

      this.startElection();

      this.isInitialized = true;
      this.initializedPlayerId = playerId;
      this.initializedIsGM = isGM;
    } catch (error) {
      console.error("Failed to initialize leader election service:", error);
    }
  }

  private setupBroadcastListeners(OBR: any) {
    // Listen for leader heartbeats
    OBR.broadcast.onMessage(TIMER_EVENTS.LEADER_HEARTBEAT, (event: any) => {
      this.handleHeartbeat(event.data);
    });

    // Listen for election messages
    OBR.broadcast.onMessage(TIMER_EVENTS.LEADER_ELECTION, (event: any) => {
      this.handleElectionMessage(event.data);
    });
  }

  private async startElection() {
    // Clear any existing election timeout
    if (this.state.electionTimeout) {
      clearTimeout(this.state.electionTimeout);
    }

    // Broadcast election intent
    this.state.electionTimeout = setTimeout(
      () => {
        this.resolveElection();
      },
      2000 + Math.random() * 1000,
    ); // Add jitter to prevent collisions
  }

  private resolveElection() {
    // If we haven't been outvoted, become leader
    if (!this.state.leaderId || this.state.leaderId === this.playerId) {
      this.becomeLeader();
    }
  }

  private becomeLeader() {
    this.state = {
      ...this.state,
      isLeader: true,
      leaderId: this.playerId,
    };

    this.startHeartbeat();
    this.notifyStateChange();
  }

  private startHeartbeat() {
    if (this.state.heartbeatInterval) {
      clearInterval(this.state.heartbeatInterval);
    }

    this.state.heartbeatInterval = setInterval(async () => {
      try {
        const OBR = (window as any).OBR;
        if (OBR && this.isOBRReady()) {
          await OBR.broadcast.sendMessage(`${TIMER_EVENTS.LEADER_HEARTBEAT}`, {
            leaderId: this.playerId,
            timestamp: Date.now(),
            isGM: this.isGM,
          });
        }
      } catch (error) {
        console.error("Failed to send heartbeat:", error);
      }
    }, 2000); // Send heartbeat every 2 seconds
  }

  private handleHeartbeat(data: any) {
    const heartbeatTimeout = this.heartbeatTimeouts.get(data.leaderId);

    // Clear existing timeout
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
    }

    // Set new timeout for this leader
    this.heartbeatTimeouts.set(
      data.leaderId,
      setTimeout(() => {
        console.log(`Leader ${data.leaderId} went offline`);

        if (this.state.leaderId === data.leaderId) {
          this.startElection();
        }
      }, 7000),
    ); // 7 seconds (3.5x heartbeat interval)

    this.heartbeatTimeouts.delete(data.leaderId);
  }

  private handleElectionMessage(data: any) {
    if (data.type === "ELECTION") {
      const currentPriority = this.calculatePriority();

      if (data.priority > currentPriority) {
        console.log(`Deferring to higher priority player: ${data.playerId}`);
        this.state.isLeader = false;
        this.state.leaderId = data.playerId;
        this.notifyStateChange();
      } else {
        // If we have same or higher priority, consider ourselves as leader
        if (data.priority >= currentPriority) {
          this.becomeLeader();
        }
      }
    }
  }

  private calculatePriority(): number {
    let priority = this.isGM ? 1000 : 0;

    if (this.playerId) {
      priority += this.hashCode(this.playerId) % 100;
    }

    return priority;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
      hash = hash >>> 0;
    }
    return Math.abs(hash);
  }

  onStateChange(callback: (state: LeaderState) => void) {
    this.callbacks.add(callback);
    callback(this.state);
    return () => this.callbacks.delete(callback);
  }

  getCurrentLeader(): LeaderState {
    return this.state;
  }

  isCurrentPlayerLeader(): boolean {
    return this.state.isLeader && this.state.leaderId === this.playerId;
  }

  async triggerElection() {
    this.startElection();
  }

  destroy() {
    if (this.state.heartbeatInterval) {
      clearInterval(this.state.heartbeatInterval);
    }

    this.heartbeatTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.heartbeatTimeouts.clear();
    this.callbacks.clear();
  }
}

export const leaderElectionService = LeaderElectionService.getInstance();
export default leaderElectionService;
