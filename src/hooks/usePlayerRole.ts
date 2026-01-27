import { useEffect, useState } from 'react';
import { useOwlbearSDK } from './useOwlbearSDK';
import OBR from '@owlbear-rodeo/sdk';
import type { PlayerRole } from '../types';

export const usePlayerRole = () => {
  const [player, setPlayer] = useState<PlayerRole | null>(null);
  const [isGM, setIsGM] = useState(false);
  const { isReady } = useOwlbearSDK();

  useEffect(() => {
    if (!isReady) return;

    const setupPlayerRole = async () => {
      try {
        if (!OBR.isAvailable) {
          // Development mode - simulate GM role
          const mockPlayer: PlayerRole = {
            id: 'dev-player',
            name: 'Developer',
            role: 'GM',
            color: '#ff6b35',
          };
          setPlayer(mockPlayer);
          setIsGM(true);
          return;
        }

        const readPlayer = async () => {
          const [id, name, role, color] = await Promise.all([
            OBR.player.getId(),
            OBR.player.getName(),
            OBR.player.getRole(),
            OBR.player.getColor(),
          ]);

          const next: PlayerRole = {
            id: String(id),
            name: String(name),
            role: role === 'GM' ? 'GM' : 'PLAYER',
            color: String(color),
          };

          setPlayer(next);
          setIsGM(role === 'GM');
        };

        // Get initial player data
        await readPlayer();

        // Listen for player changes (unsubscribe on cleanup)
        return OBR.player.onChange(() => {
          void readPlayer();
        });
      } catch (error) {
        console.error('Failed to setup player role:', error);
      }
    };

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const unsub = await setupPlayerRole();
      if (cancelled) {
        if (unsub) unsub();
        return;
      }
      unsubscribe = unsub;
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [isReady]);

  return {
    player,
    isGM,
    isPlayer: !isGM,
    hasPermission: (requiredRole: 'GM' | 'PLAYER' | 'ANY') => {
      if (requiredRole === 'ANY') return true;
      if (requiredRole === 'GM') return isGM;
      if (requiredRole === 'PLAYER') return true; // Everyone can access player-level features
      return false;
    },
  };
};
