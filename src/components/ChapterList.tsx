"use client";

import { Video } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { BarChart2, CheckCircle, Play, Trash2 } from "lucide-react";

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
  return (
    <div className="space-y-1">
      {videos.map((video, index) => {
        const isPlaying = index === currentVideoIndex;
        const progress = videoProgress[video.id];
        const isWatched = progress?.watched || false;

        return (
          <div key={video.id} className="group relative flex items-center">
            <button
              onClick={() => onVideoSelect(index)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left pr-12 ${
                isPlaying ? "bg-secondary" : "hover:bg-hover"
              }`}
            >
              {/* Index or Playing Icon */}
              <div className="w-6 shrink-0 flex items-center justify-center text-muted text-sm font-medium">
                {isPlaying ? (
                  <BarChart2
                    size={16}
                    className="text-green-500 animate-pulse"
                  />
                ) : (
                  <span className="group-hover:hidden">{index + 1}</span>
                )}
                {!isPlaying && (
                  <Play
                    size={12}
                    className="hidden group-hover:block text-white fill-white"
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
                    <CheckCircle
                      size={16}
                      className="text-green-500 shrink-0"
                    />
                  )}
                </div>
                <p className="text-[13px] text-muted">{video.duration}</p>
              </div>
            </button>

            {onDeleteVideo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteVideo(video.id);
                }}
                className="absolute right-2 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="Remove Chapter"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
