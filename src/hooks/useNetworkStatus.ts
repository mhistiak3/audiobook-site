"use client";

import { useSyncExternalStore } from "react";

// Subscribe to network status changes
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true; // Assume online during SSR
}

/**
 * Hook to detect online/offline status
 * Returns true if online, false if offline
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Utility function to check if currently online
 * Use this in non-React contexts (like hybridStorage)
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
