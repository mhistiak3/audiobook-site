"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useAuth } from "@/context/AuthContext";
import {
  getApiKeyStatus,
  getUserApiKey,
  resetRequestCount,
  saveUserApiKey,
} from "@/lib/apiKeyManager";
import {
  ExternalLink,
  Key,
  LogOut,
  PlayCircle,
  RotateCcw,
  RotateCw,
  User,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [defaultSpeed, setDefaultSpeed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("defaultPlaybackSpeed");
      return saved ? parseFloat(saved) : 1;
    }
    return 1;
  });
  const [skipBackward, setSkipBackward] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skipBackwardSeconds");
      return saved ? parseInt(saved) : 10;
    }
    return 10;
  });
  const [skipForward, setSkipForward] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skipForwardSeconds");
      return saved ? parseInt(saved) : 30;
    }
    return 30;
  });
  const [autoPlayNext, setAutoPlayNext] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("autoPlayNext");
      return saved || "next"; // Options: "next", "stop", "repeat"
    }
    return "next";
  });
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState<{
    isCustom: boolean;
    shouldPrompt: boolean;
    requestCount: number;
  }>({
    isCustom: false,
    shouldPrompt: false,
    requestCount: 0,
  });
  const [apiKeyError, setApiKeyError] = useState("");
  const [apiKeySuccess, setApiKeySuccess] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Load API key status
  useEffect(() => {
    const loadApiKeyStatus = async () => {
      const status = await getApiKeyStatus();
      setApiKeyStatus({
        isCustom: status.isCustom,
        shouldPrompt: status.shouldPrompt,
        requestCount: status.requestCount,
      });

      if (status.isCustom) {
        const key = await getUserApiKey();
        if (key) {
          // Show masked key (first 8 chars + ...)
          setApiKey(
            key.substring(0, 8) + "..." + key.substring(key.length - 4),
          );
          setShowApiKeyInput(false);
        }
      } else {
        setApiKey("");
        setShowApiKeyInput(status.shouldPrompt);
      }
    };

    if (!authLoading) {
      loadApiKeyStatus();
    }
  }, [authLoading]);

  const handleSpeedChange = (speed: number) => {
    setDefaultSpeed(speed);
    localStorage.setItem("defaultPlaybackSpeed", speed.toString());
  };

  const handleSkipBackwardChange = (seconds: number) => {
    setSkipBackward(seconds);
    localStorage.setItem("skipBackwardSeconds", seconds.toString());
  };

  const handleSkipForwardChange = (seconds: number) => {
    setSkipForward(seconds);
    localStorage.setItem("skipForwardSeconds", seconds.toString());
  };

  const handleAutoPlayNextChange = (option: string) => {
    setAutoPlayNext(option);
    localStorage.setItem("autoPlayNext", option);
  };

  const handleSignOut = async () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    router.push("/login");
    setShowSignOutDialog(false);
  };

  const handleApiKeySave = async () => {
    setApiKeyError("");
    setApiKeySuccess(false);

    if (!apiKey.trim()) {
      setApiKeyError("Please enter an API key");
      return;
    }

    // Basic validation - YouTube API keys are usually 39 characters
    if (apiKey.length < 30) {
      setApiKeyError("Invalid API key format. Please check your key.");
      return;
    }

    const success = await saveUserApiKey(apiKey.trim());
    if (success) {
      setApiKeySuccess(true);
      resetRequestCount();
      setShowApiKeyInput(false);
      // Reload status
      const status = await getApiKeyStatus();
      setApiKeyStatus({
        isCustom: status.isCustom,
        shouldPrompt: status.shouldPrompt,
        requestCount: status.requestCount,
      });
      // Show masked key
      const key = await getUserApiKey();
      if (key) {
        setApiKey(key.substring(0, 8) + "..." + key.substring(key.length - 4));
      }
      setTimeout(() => setApiKeySuccess(false), 3000);
    } else {
      setApiKeyError("Failed to save API key. Please try again.");
    }
  };

  const handleApiKeyDelete = async () => {
    const { deleteUserApiKey } = await import("@/lib/apiKeyManager");
    await deleteUserApiKey();
    setApiKey("");
    setShowApiKeyInput(false);
    setApiKeyStatus({
      isCustom: false,
      shouldPrompt: false,
      requestCount: 0,
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2];
  const skipOptions = [5, 10, 15, 30, 45, 60];

  return (
    <div className="min-h-screen bg-linear-to-b from-hover to-surface pb-24">
      {/* Header */}
      <header className="pt-(--safe-top) px-6 pb-6 sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-white/5">
        <div className="pt-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted text-sm mt-1">Customize your experience</p>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Account Section */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Account
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Email</span>
              <span className="font-medium text-sm">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-3 bg-error/10 text-error hover:bg-error/20 rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors border border-error/20"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Playback Settings */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            Default Playback Speed
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  defaultSpeed === speed
                    ? "bg-primary text-black"
                    : "bg-hover text-white hover:bg-hover/80"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">
            This will be applied to all new playback sessions
          </p>
        </div>

        {/* Skip Intervals */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <RotateCcw size={20} className="text-primary" />
            Skip Backward Interval
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {skipOptions.map((seconds) => (
              <button
                key={`back-${seconds}`}
                onClick={() => handleSkipBackwardChange(seconds)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  skipBackward === seconds
                    ? "bg-primary text-black"
                    : "bg-hover text-white hover:bg-hover/80"
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>

          <h3 className="font-semibold mb-4 flex items-center gap-2 mt-6">
            <RotateCw size={20} className="text-primary" />
            Skip Forward Interval
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {skipOptions.map((seconds) => (
              <button
                key={`forward-${seconds}`}
                onClick={() => handleSkipForwardChange(seconds)}
                className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  skipForward === seconds
                    ? "bg-primary text-black"
                    : "bg-hover text-white hover:bg-hover/80"
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">
            Customize how many seconds to skip when using skip buttons
          </p>
        </div>

        {/* Auto-play Next */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PlayCircle size={20} className="text-primary" />
            After Video Completes
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleAutoPlayNextChange("next")}
              className={`w-full px-4 py-4 rounded-lg font-medium text-sm transition-all text-left ${
                autoPlayNext === "next"
                  ? "bg-primary text-black"
                  : "bg-hover text-white hover:bg-hover/80"
              }`}
            >
              <div className="font-semibold">Play Next Video</div>
              <div className="text-xs opacity-80 mt-1">
                Automatically continue to the next chapter
              </div>
            </button>
            <button
              onClick={() => handleAutoPlayNextChange("stop")}
              className={`w-full px-4 py-4 rounded-lg font-medium text-sm transition-all text-left ${
                autoPlayNext === "stop"
                  ? "bg-primary text-black"
                  : "bg-hover text-white hover:bg-hover/80"
              }`}
            >
              <div className="font-semibold">Stop Playing</div>
              <div className="text-xs opacity-80 mt-1">
                Pause after current video ends
              </div>
            </button>
            <button
              onClick={() => handleAutoPlayNextChange("repeat")}
              className={`w-full px-4 py-4 rounded-lg font-medium text-sm transition-all text-left ${
                autoPlayNext === "repeat"
                  ? "bg-primary text-black"
                  : "bg-hover text-white hover:bg-hover/80"
              }`}
            >
              <div className="font-semibold">Repeat Current Video</div>
              <div className="text-xs opacity-80 mt-1">
                Loop the current chapter continuously
              </div>
            </button>
          </div>
        </div>

        {/* API Key Settings */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Key size={20} className="text-primary" />
            YouTube API Key
          </h3>
          {apiKeyStatus.shouldPrompt && !apiKeyStatus.isCustom && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-primary font-medium mb-1">
                High API usage detected
              </p>
              <p className="text-xs text-muted">
                To avoid rate limits and ensure uninterrupted service, please
                add your own YouTube API key.
              </p>
            </div>
          )}
          {apiKeyStatus.isCustom ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-hover rounded-lg">
                <div>
                  <p className="text-sm font-medium">Custom API Key Active</p>
                  <p className="text-xs text-muted mt-1 font-mono">{apiKey}</p>
                </div>
                <button
                  onClick={handleApiKeyDelete}
                  className="text-xs text-error hover:text-error/80 px-3 py-1.5 border border-error/30 hover:border-error/50 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
              <p className="text-xs text-muted">
                Your API key is securely stored and used for all YouTube API
                requests.
              </p>
            </div>
          ) : showApiKeyInput ? (
            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setApiKeyError("");
                  }}
                  placeholder="Enter your YouTube API key"
                  className="w-full px-4 py-3 bg-hover border border-white/10 rounded-lg text-sm text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {apiKeyError && (
                  <p className="text-xs text-error mt-2">{apiKeyError}</p>
                )}
                {apiKeySuccess && (
                  <p className="text-xs text-success mt-2">
                    API key saved successfully!
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApiKeySave}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-dark font-semibold rounded-lg transition-colors text-sm"
                >
                  Save API Key
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKey("");
                    setApiKeyError("");
                  }}
                  className="px-4 py-2.5 bg-hover hover:bg-hover/80 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:text-primary-hover transition-colors"
              >
                <ExternalLink size={14} />
                Get your API key from Google Cloud Console
              </a>
              <p className="text-xs text-muted mt-2">
                Don&apos;t have an API key?{" "}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Create one here
                </a>
                . Your API key will be stored securely and only used for YouTube
                API requests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Add your own YouTube API key to avoid rate limits and ensure
                uninterrupted service.
              </p>
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="w-full px-4 py-2.5 bg-primary hover:bg-primary-hover text-dark font-semibold rounded-lg transition-colors text-sm"
              >
                Add API Key
              </button>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:text-primary-hover transition-colors justify-center"
              >
                <ExternalLink size={14} />
                How to get an API key
              </a>
            </div>
          )}
        </div>

        {/* Theme Settings */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-4">Appearance</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Dark Mode</p>
              <p className="text-xs text-muted mt-1">
                Currently enabled by default
              </p>
            </div>
            <DarkModeToggle />
          </div>
        </div>

        {/* App Info */}
        <div className="bg-secondary rounded-xl p-5 border border-white/5">
          <h3 className="font-semibold mb-3">About</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Version</span>
              <span className="font-medium">1.4.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">App Name</span>
              <span className="font-medium">iAudioBook</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Sign Out Dialog */}
      <ConfirmDialog
        isOpen={showSignOutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </div>
  );
}
