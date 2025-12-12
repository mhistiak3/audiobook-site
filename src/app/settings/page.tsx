"use client";

import DarkModeToggle from "@/components/DarkModeToggle";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Zap } from "lucide-react";
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
  const mounted = true;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const handleSpeedChange = (speed: number) => {
    setDefaultSpeed(speed);
    localStorage.setItem("defaultPlaybackSpeed", speed.toString());
  };

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
      router.push("/login");
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="min-h-screen bg-linear-to-b from-hover to-surface pb-24">
      {/* Header */}
      <header className="pt-[var(--safe-top)] px-6 pb-6 sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-white/5">
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
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">App Name</span>
              <span className="font-medium">iAudioBook</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
