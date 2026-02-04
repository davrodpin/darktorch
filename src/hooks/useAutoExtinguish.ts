import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useRef } from "react";
import { useTimerAutoExtinguish, useTimerIsCompleted } from "../store/timerStore";
import { useLeaderElection } from "./useLeaderElection";

export const useAutoExtinguish = () => {
  const isCompleted = useTimerIsCompleted();
  const autoExtinguish = useTimerAutoExtinguish();
  const { isCurrentPlayerLeader } = useLeaderElection();
  const hasExtinguishedRef = useRef(false);

  useEffect(() => {
    if (!isCompleted) {
      hasExtinguishedRef.current = false;
      return;
    }

    if (hasExtinguishedRef.current || !autoExtinguish) return;
    if (!isCurrentPlayerLeader()) return;
    if (!OBR.isAvailable) return;

    hasExtinguishedRef.current = true;

    const extinguishLights = async () => {
      try {
        const [localId, localRole, partyPlayers] = await Promise.all([
          OBR.player.getId(),
          OBR.player.getRole(),
          OBR.party.getPlayers(),
        ]);

        const gmIds = new Set<string>();
        if (localRole === "GM") gmIds.add(localId);
        for (const p of partyPlayers) {
          if (p.role === "GM") gmIds.add(p.id);
        }

        const allItems = await OBR.scene.items.getItems();

        const LIGHT_METADATA_KEY = "rodeo.owlbear.dynamic-fog/light";

        // Find non-GM tokens that have light metadata
        const tokensWithLights = allItems.filter(
          (item) =>
            item.layer === "CHARACTER" &&
            !gmIds.has(item.createdUserId) &&
            LIGHT_METADATA_KEY in item.metadata,
        );

        if (tokensWithLights.length === 0) return;

        // Remove the light metadata from these tokens
        await OBR.scene.items.updateItems(tokensWithLights, (drafts) => {
          for (const draft of drafts) {
            delete draft.metadata[LIGHT_METADATA_KEY];
          }
        });
      } catch (error) {
        console.error("Failed to auto-extinguish lights:", error);
      }
    };

    extinguishLights();
  }, [isCompleted, autoExtinguish, isCurrentPlayerLeader]);
};
