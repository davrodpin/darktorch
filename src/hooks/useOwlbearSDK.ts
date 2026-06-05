import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

type OwlbearSDKSharedState = {
  isReady: boolean;
};

let sharedState: OwlbearSDKSharedState = {
  isReady: false,
};

const subscribers = new Set<(state: OwlbearSDKSharedState) => void>();
let activeSubscribers = 0;

let initPromise: Promise<void> | null = null;

function emitSharedState() {
  for (const subscriber of subscribers) subscriber(sharedState);
}

function setSharedReady(isReady: boolean) {
  if (sharedState.isReady === isReady) return;
  sharedState = { ...sharedState, isReady };
  emitSharedState();
}

async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = new Promise<void>((resolve) => {
    let resolved = false;
    const resolveOnce = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    // If onReady never fires for some reason, don't block the app forever.
    const fallback = setTimeout(() => {
      setSharedReady(true);
      resolveOnce();
    }, 2000);

    OBR.onReady(() => {
      clearTimeout(fallback);
      setSharedReady(true);
      resolveOnce();
    });
  });

  return initPromise;
}

export const useOwlbearSDK = () => {
  const [localState, setLocalState] = useState<OwlbearSDKSharedState>(
    () => ({ ...sharedState }),
  );

  useEffect(() => {
    activeSubscribers += 1;

    const subscriber = (state: OwlbearSDKSharedState) => {
      setLocalState({ ...state });
    };

    subscribers.add(subscriber);
    subscriber(sharedState);

    void ensureInitialized();

    return () => {
      subscribers.delete(subscriber);
      activeSubscribers -= 1;
      if (activeSubscribers < 0) activeSubscribers = 0;
    };
  }, []);

  return {
    isReady: localState.isReady,
  };
};
