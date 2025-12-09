"use client";

import { Playlist } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Music2, Trash2 } from "lucide-react";

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete?: () => void;
}

export default function PlaylistCard({
  playlist,
  onDelete,
}: PlaylistCardProps) {
  return (
    <div className="group relative">
      <Link href={`/playlist/${playlist.id}`} className="block">
        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-[#282828] transition-colors pr-12">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-[#333] shadow-md">
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
            <h3 className="text-white font-medium text-[15px] truncate-1 mb-1">
              {playlist.title}
            </h3>
            <p className="text-[#A7A7A7] text-[13px] truncate-1">
              Playlist • {playlist.videoCount} tracks
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={20}
            className="text-[#555] group-hover:text-white transition-colors"
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
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
          title="Delete Playlist"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
