"use client";

import { useAppDispatch } from "@/store/hooks";
import { setIsPlaying } from "@/store/playerSlice";
import { Clock, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SleepTimerProps {
  onFinishChapter?: () => void;
  currentVideoDuration?: number;
  currentVideoTime?: number;
}

export default function SleepTimer({
  onFinishChapter,
  currentVideoDuration = 0,
  currentVideoTime = 0,
}: SleepTimerProps) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [fadeOutStarted, setFadeOutStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const timerPresets = [
    { label: "15 min", value: 15 * 60 },
    { label: "30 min", value: 30 * 60 },
    { label: "45 min", value: 45 * 60 },
    { label: "60 min", value: 60 * 60 },
  ];

  const startFadeOut = useCallback(() => {
    setFadeOutStarted(true);
    // Gradually pause the player
    fadeTimeoutRef.current = setTimeout(() => {
      dispatch(setIsPlaying(false));
    }, 5000);
  }, [dispatch]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(0);
    setFadeOutStarted(false);
    dispatch(setIsPlaying(false));
    if (timerRef.current) clearInterval(timerRef.current);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
  }, [dispatch]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            return 0;
          }
          // Start fade out 5 seconds before end
          if (prev === 6 && !fadeOutStarted) {
            startFadeOut();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, fadeOutStarted, startFadeOut, stopTimer]);

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setIsActive(true);
    setFadeOutStarted(false);
    setIsOpen(false);
  };

  const startFinishChapterTimer = () => {
    if (onFinishChapter && currentVideoDuration > 0 && currentVideoTime > 0) {
      const remaining = currentVideoDuration - currentVideoTime;
      if (remaining > 0) {
        startTimer(Math.ceil(remaining));
      }
    }
  };

  const cancelTimer = () => {
    stopTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Timer Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-2 rounded-full transition-colors ${
          isActive
            ? "bg-primary text-black"
            : "text-muted hover:text-white hover:bg-hover"
        }`}
        title="Sleep Timer"
      >
        <Clock size={20} />
        {isActive && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs font-bold rounded-full flex items-center justify-center">
            {Math.ceil(timeLeft / 60)}
          </span>
        )}
      </button>

      {/* Active Timer Display */}
      {isActive && !isOpen && (
        <div className="fixed top-[calc(var(--safe-top)+4rem)] right-6 bg-secondary rounded-lg px-3 py-2 border border-primary/30 shadow-lg z-50 animate-slideDown">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span className="font-mono font-semibold text-sm">
              {formatTime(timeLeft)}
            </span>
            <button
              onClick={cancelTimer}
              className="ml-1 text-muted hover:text-error transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Timer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-70 flex items-end justify-center bg-black/70 animate-fadeIn">
          <div className="w-full max-w-[480px] bg-secondary rounded-t-3xl p-6 pb-[calc(var(--safe-bottom)+1.5rem)] animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Sleep Timer</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {isActive ? (
              <div className="text-center py-8">
                <div className="text-5xl font-mono font-bold mb-4">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-muted mb-6">
                  Playback will stop automatically
                </p>
                <button
                  onClick={cancelTimer}
                  className="bg-error hover:bg-error/80 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel Timer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted text-sm mb-4">
                  Choose when to stop playback
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {timerPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => startTimer(preset.value)}
                      className="bg-hover hover:bg-primary hover:text-black text-white font-semibold py-4 rounded-xl transition-all border border-white/5 hover:border-primary"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {currentVideoDuration > 0 && onFinishChapter && (
                  <button
                    onClick={startFinishChapterTimer}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-4 rounded-xl transition-all border border-primary/30 mt-4"
                  >
                    End of Current Chapter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
