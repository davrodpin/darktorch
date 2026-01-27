import { useEffect, useState } from 'react';
import { usePlayerRole } from './usePlayerRole';
import { useOwlbearSDK } from './useOwlbearSDK';
import leaderElectionService from '../services/leaderElection';
import type { LeaderState } from '../types';

export const useLeaderElection = () => {
  const [leaderState, setLeaderState] = useState<LeaderState>({
    isLeader: false,
    leaderId: undefined,
  });
  const { player, isGM } = usePlayerRole();
  const { isReady } = useOwlbearSDK();

  useEffect(() => {
    if (!isReady || !player) return;

    // Initialize the leader election service
    leaderElectionService.initialize(player.id, isGM);

    // Subscribe to leader state changes
    const unsubscribe = leaderElectionService.onStateChange((state) => {
      setLeaderState(state);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [isReady, player, isGM]);

  const triggerElection = async () => {
    await leaderElectionService.triggerElection();
  };

  const isCurrentPlayerLeader = (): boolean => {
    return leaderElectionService.isCurrentPlayerLeader();
  };

  return {
    leaderState,
    isLeader: leaderState.isLeader,
    leaderId: leaderState.leaderId,
    isCurrentPlayerLeader,
    triggerElection,
  };
};