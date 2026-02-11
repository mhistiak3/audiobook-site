"use client";

import { shareVideo } from "@/lib/share";
import { Video } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { BarChart2, CheckCircle, Play, Share2, Trash2 } from "lucide-react";
import { useState } from "react";

interface ChapterListProps {
  videos: Video[];
  currentVideoIndex: number;
  onVideoSelect: (index: number) => void;
  onDeleteVideo?: (videoId: string) => void;
}

export default function ChapterList({
  videos,
  currentVideoIndex,
  onVideoSelect,
  onDeleteVideo,
}: ChapterListProps) {
  const videoProgress = useAppSelector((state) => state.player.videoProgress);
  const [shareToast, setShareToast] = useState<string | null>(null);

  return (
    <div className="space-y-1 relative">
      {videos.map((video, index) => {
        const isPlaying = index === currentVideoIndex;
        const progress = videoProgress[video.id];
        const isWatched = progress?.watched || false;

        return (
          <div key={video.id} className="group relative flex items-center">
            <button
              onClick={() => onVideoSelect(index)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left pr-20 ${
                isPlaying ? "bg-secondary" : "hover:bg-hover"
              }`}
            >
              {/* Index or Playing Icon */}
              <div className="w-6 shrink-0 flex items-center justify-center text-muted text-sm font-medium">
                {isPlaying ? (
                  <BarChart2 size={16} className="text-primary animate-pulse" />
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                {!isPlaying && (
                  <Play
                    size={12}
                    className="hidden group-hover:block text-foreground fill-foreground"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-[15px] font-medium truncate flex-1 ${
                      isPlaying ? "text-green-500" : "text-white"
                    }`}
                  >
                    {video.title}
                  </h3>
                  {isWatched && (
                    <CheckCircle size={16} className="text-primary shrink-0" />
                  )}
                </div>
                <p className="text-[13px] text-muted">{video.duration}</p>
              </div>
            </button>

            {/* Action buttons */}
            <div className="absolute right-2 flex items-center gap-1  transition-all">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const result = await shareVideo(video.id, video.title);
                  if (result.success) {
                    setShareToast(
                      result.method === "clipboard"
                        ? "Link copied!"
                        : "Shared!",
                    );
                    setTimeout(() => setShareToast(null), 2000);
                  }
                }}
                className="p-2 text-muted-dark hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                title="Share Chapter"
              >
                <Share2 size={16} />
              </button>
              {onDeleteVideo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVideo(video.id);
                  }}
                  className="p-2 text-muted-dark hover:text-error hover:bg-error-bg rounded-full transition-all"
                  title="Remove Chapter"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-primary text-black px-4 py-2 rounded-full shadow-lg text-sm font-medium">
            {shareToast}
          </div>
        </div>
      )}
    </div>
  );
}
