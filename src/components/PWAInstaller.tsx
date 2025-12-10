"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Check if user has seen the banner before
    const hasSeenBanner = localStorage.getItem("pwa-banner-seen");

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner only if user hasn't seen it before
      if (!hasSeenBanner) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

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

  if (!showBanner) return null;

  return (
    <div className="fixed top-(--safe-top) left-0 right-0 z-50 px-4 pt-4 animate-slideDown">
      <div className="max-w-[480px] mx-auto bg-linear-to-r from-primary to-primary-hover rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        <Download size={32} className="text-dark shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-dark font-bold text-sm mb-1">
            Install iAudioBook
          </h3>
          <p className="text-foreground text-xs">
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
  );
}
