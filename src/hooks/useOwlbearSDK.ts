import OBR from "@owlbear-rodeo/sdk";
import { useCallback, useEffect, useState } from "react";
import type { ConnectionState } from "../types";

type OwlbearSDKSharedState = {
  isReady: boolean;
  connectionState: ConnectionState;
};

const initialConnectionState: ConnectionState = {
  isConnected: false,
  isReconnecting: false,
  lastConnected: 0,
  reconnectAttempts: 0,
};

let sharedState: OwlbearSDKSharedState = {
  isReady: false,
  connectionState: initialConnectionState,
};

const subscribers = new Set<(state: OwlbearSDKSharedState) => void>();
let activeSubscribers = 0;

let initPromise: Promise<void> | null = null;
let monitorCleanup: (() => void) | null = null;
let monitoringPromise: Promise<void> | null = null;

let sceneItemsUnsubscribe: (() => void) | null = null;
let sceneReadyUnsubscribe: (() => void) | null = null;
let connectionInterval: ReturnType<typeof setInterval> | null = null;

function emitSharedState() {
  for (const subscriber of subscribers) subscriber(sharedState);
}

function setSharedConnectionState(
  update:
    | Partial<ConnectionState>
    | ((prev: ConnectionState) => ConnectionState),
) {
  const nextConnectionState = typeof update === "function"
    ? update(sharedState.connectionState)
    : null;

  sharedState = {
    ...sharedState,
    connectionState: nextConnectionState ??
      { ...sharedState.connectionState, ...update },
  };
  emitSharedState();
}

function setSharedReady(isReady: boolean) {
  if (sharedState.isReady === isReady) return;
  sharedState = { ...sharedState, isReady };
  emitSharedState();
}

async function runConnectionCheck(): Promise<void> {
  if (!OBR.isAvailable) return;

  try {
    // Light-weight API call that doesn't require scene readiness.
    await OBR.player.getId();

    setSharedConnectionState((prev) => {
      if (!prev.isConnected || prev.isReconnecting) {
        return {
          ...prev,
          isConnected: true,
          isReconnecting: false,
          lastConnected: Date.now(),
          reconnectAttempts: 0,
        };
      }
      return { ...prev, lastConnected: Date.now() };
    });
  } catch {
    setSharedConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      isReconnecting: true,
      reconnectAttempts: prev.reconnectAttempts + 1,
    }));
  }
}

function stopMonitoring() {
  if (connectionInterval) {
    clearInterval(connectionInterval);
    connectionInterval = null;
  }

  if (sceneItemsUnsubscribe) {
    sceneItemsUnsubscribe();
    sceneItemsUnsubscribe = null;
  }

  if (sceneReadyUnsubscribe) {
    sceneReadyUnsubscribe();
    sceneReadyUnsubscribe = null;
  }
}

async function startMonitoringOnce() {
  if (!OBR.isAvailable) return;
  if (monitoringPromise) return monitoringPromise;

  monitoringPromise = (async () => {
    if (monitorCleanup) return;

    // Periodic connection checks.
    connectionInterval = setInterval(() => {
      void runConnectionCheck();
    }, 5000);

    const attachSceneListeners = () => {
      if (sceneItemsUnsubscribe) return;
      sceneItemsUnsubscribe = OBR.scene.items.onChange(() => {
        setSharedConnectionState((prev) => ({
          ...prev,
          lastConnected: Date.now(),
        }));
      });
    };

    const detachSceneListeners = () => {
      if (sceneItemsUnsubscribe) {
        sceneItemsUnsubscribe();
        sceneItemsUnsubscribe = null;
      }
    };

    // Listen for scene ready changes, and only attach item listeners when ready.
    sceneReadyUnsubscribe = OBR.scene.onReadyChange((ready) => {
      if (ready) attachSceneListeners();
      else detachSceneListeners();
    });

    // Attach immediately if the scene is already ready.
    try {
      const ready = await OBR.scene.isReady();
      if (ready) attachSceneListeners();
    } catch {
      // If the scene check fails, connection monitoring will handle it.
    }

    monitorCleanup = () => {
      stopMonitoring();
      monitorCleanup = null;
      monitoringPromise = null;
    };
  })();

  return monitoringPromise;
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
      setSharedConnectionState((prev) => ({
        ...prev,
        isConnected: true,
        lastConnected: Date.now(),
        reconnectAttempts: 0,
      }));

      void startMonitoringOnce();
      resolveOnce();
    });
  });

  return initPromise;
}

export const useOwlbearSDK = () => {
  const [localState, setLocalState] = useState<OwlbearSDKSharedState>(() => ({
    ...sharedState,
    connectionState: { ...sharedState.connectionState },
  }));

  useEffect(() => {
    activeSubscribers += 1;

    const subscriber = (state: OwlbearSDKSharedState) => {
      setLocalState({
        ...state,
        connectionState: { ...state.connectionState },
      });
    };

    subscribers.add(subscriber);
    subscriber(sharedState);

    void ensureInitialized().then(() => {
      void startMonitoringOnce();
    });

    return () => {
      subscribers.delete(subscriber);
      activeSubscribers -= 1;

      if (activeSubscribers <= 0) {
        activeSubscribers = 0;
        if (monitorCleanup) monitorCleanup();
      }
    };
  }, []);

  const retryConnection = useCallback(async () => {
    await ensureInitialized();
    await runConnectionCheck();
  }, []);

  return {
    isReady: localState.isReady,
    connectionState: localState.connectionState,
    retryConnection,
  };
};
