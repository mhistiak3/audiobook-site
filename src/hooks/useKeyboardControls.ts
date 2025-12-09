// Custom hook for keyboard controls

import { useEffect } from "react";

interface KeyboardControlsOptions {
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  enabled?: boolean;
}

export function useKeyboardControls({
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  onVolumeUp,
  onVolumeDown,
  enabled = true,
}: KeyboardControlsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeekBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeekForward();
          break;
        case "ArrowUp":
          e.preventDefault();
          onVolumeUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          onVolumeDown();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    onPlayPause,
    onSeekBackward,
    onSeekForward,
    onVolumeUp,
    onVolumeDown,
  ]);
}
