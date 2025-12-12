"use client";

import { Playlist } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { ChevronRight, Music2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete?: () => void;
}

export default function PlaylistCard({
  playlist,
  onDelete,
}: PlaylistCardProps) {
  const videoProgress = useAppSelector((state) => state.player.videoProgress);

  // Calculate playlist progress
  const playlistProgress = useMemo(() => {
    if (playlist.videoCount === 0) return 0;

    const completedCount = playlist.videos.filter((video) => {
      const progress = videoProgress[video.id];
      return progress?.watched;
    }).length;

    return (completedCount / playlist.videoCount) * 100;
  }, [playlist, videoProgress]);

  const hasProgress = playlistProgress > 0;

  return (
    <div className="group relative">
      <Link href={`/playlist/${playlist.id}`} className="block">
        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary transition-colors pr-12">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-card shadow-md">
            {playlist.thumbnail ? (
              <Image
                src={playlist.thumbnail}
                alt={playlist.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 size={24} className="text-gray-500" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-medium text-[15px] truncate-1 mb-1">
              {playlist.title}
            </h3>
            <p className="text-muted text-[13px] truncate-1 mb-1">
              {playlist.videoCount === 1
                ? "Video"
                : `Playlist • ${playlist.videoCount} tracks`}
            </p>
            {hasProgress && (
              <div className="w-full bg-hover rounded-full h-1 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${playlistProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight
            size={20}
            className="text-icon group-hover:text-foreground transition-colors"
          />
        </div>
      </Link>

      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-dark hover:text-error hover:bg-error-bg rounded-full transition-all opacity-0 group-hover:opacity-100"
          title="Delete Playlist"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
