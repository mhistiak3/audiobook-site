"use client";

import { Download, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  useEffect(() => {
    // Register service worker with update handling
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Check for updates immediately
          registration.update();

          // Check for waiting service worker (update available)
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowUpdateBanner(true);
          }

          // Listen for new service worker installing
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New version available
                  setWaitingWorker(newWorker);
                  setShowUpdateBanner(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Handle controller change (new SW activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check localStorage every time the event fires to see if banner was dismissed
      const hasSeenBanner = localStorage.getItem("pwa-banner-seen");
      if (!hasSeenBanner) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdateBanner(false);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    // Clear the prompt
    setDeferredPrompt(null);
    setShowBanner(false);
    localStorage.setItem("pwa-banner-seen", "true");
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-seen", "true");
  };

  return (
    <>
      {/* Update Available Banner */}
      {showUpdateBanner && (
        <div className="fixed top-(--safe-top) left-0 right-0 z-60 px-4 pt-4 animate-slideDown">
          <div className="max-w-[480px] mx-auto bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <RefreshCw size={28} className="text-white shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm mb-1">
                Update Available
              </h3>
              <p className="text-white/80 text-xs">
                A new version is ready. Refresh to update.
              </p>
            </div>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-white text-blue-600 rounded-full text-xs font-semibold hover:bg-white/90 transition-colors shrink-0"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Install Banner */}
      {showBanner && !showUpdateBanner && (
        <div className="fixed top-(--safe-top) left-0 right-0 z-50 px-4 pt-4 animate-slideDown">
          <div className="max-w-[480px] mx-auto bg-linear-to-r from-primary to-primary-hover rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <Download size={32} className="text-dark shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-dark font-bold text-sm mb-1">
                Install iAudioBook
              </h3>
              <p className="text-foreground! text-xs">
                Add to home screen for a better experience
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-dark text-foreground rounded-full text-xs font-semibold hover:bg-dark/90 transition-colors shrink-0"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-dark/10 rounded-full transition-colors shrink-0"
            >
              <X size={20} className="text-dark" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
