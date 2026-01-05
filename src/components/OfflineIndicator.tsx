"use client";

import { useOnlineStatus } from "@/hooks/useNetworkStatus";
import { WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const wasOfflineRef = useRef(false);
  const prevOnlineRef = useRef(isOnline);

  useEffect(() => {
    // Track if we went offline
    if (!isOnline) {
      wasOfflineRef.current = true;
    }

    // Check if we came back online from being offline
    if (isOnline && !prevOnlineRef.current && wasOfflineRef.current) {
      setShowBackOnline(true);
      const timer = setTimeout(() => {
        setShowBackOnline(false);
        wasOfflineRef.current = false;
      }, 3000);
      prevOnlineRef.current = isOnline;
      return () => clearTimeout(timer);
    }

    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  if (isOnline && !showBackOnline) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 right-4 z-50 max-w-[480px] mx-auto animate-slideUp ${
        !isOnline ? "bg-red-500/90" : "bg-green-500/90"
      } rounded-xl shadow-lg px-4 py-3 flex items-center gap-3`}
    >
      {!isOnline ? (
        <>
          <WifiOff size={20} className="text-white shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">
              You&apos;re offline
            </p>
            <p className="text-white/80 text-xs">
              Using local data. Changes will sync when online.
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 text-center">
          <p className="text-white text-sm font-medium">Back online!</p>
        </div>
      )}
    </div>
  );
}
