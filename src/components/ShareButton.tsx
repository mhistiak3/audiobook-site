"use client";

import { sharePlaylist, shareVideo } from "@/lib/share";
import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  type: "video" | "playlist";
  id: string;
  title: string;
  videoCount?: number;
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
  onShare?: (success: boolean, method: "share" | "clipboard") => void;
}

export default function ShareButton({
  type,
  id,
  title,
  videoCount = 1,
  className = "",
  iconSize = 18,
  showLabel = false,
  onShare,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSharing) return;

    setIsSharing(true);

    try {
      const result =
        type === "video"
          ? await shareVideo(id, title)
          : await sharePlaylist(id, title, videoCount);

      onShare?.(result.success, result.method);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`flex items-center gap-2 transition-all ${
        isSharing ? "opacity-50" : "hover:opacity-80"
      } ${className}`}
      title={`Share ${type === "video" ? "video" : "playlist"}`}
      aria-label={`Share ${title}`}
    >
      <Share2 size={iconSize} className={isSharing ? "animate-pulse" : ""} />
      {showLabel && <span>Share</span>}
    </button>
  );
}
