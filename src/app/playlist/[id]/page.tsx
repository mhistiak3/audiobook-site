"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { Playlist } from "@/lib/types";
import ChapterList from "@/components/ChapterList";
import AudioPlayer from "@/components/AudioPlayer";
import Image from "next/image";
import { ArrowLeft, Clock, MoreVertical } from "lucide-react";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    const loadedPlaylist = storage.getPlaylist(playlistId);
    if (!loadedPlaylist) {
      router.push("/");
      return;
    }
    setPlaylist(loadedPlaylist);
  }, [playlistId, router]);

  if (!playlist) return null;

  const totalDuration = Math.floor(
    playlist.videos.reduce((acc, v) => acc + v.durationSeconds, 0) / 60
  );

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Remove this chapter from playlist?")) {
      storage.removeVideo(playlistId, videoId);
      // Refresh playlist
      const updated = storage.getPlaylist(playlistId);
      if (updated) {
        setPlaylist(updated);
        // Adjust current index if needed
        if (currentVideoIndex >= updated.videos.length) {
          setCurrentVideoIndex(Math.max(0, updated.videos.length - 1));
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-24">
      {/* ... header ... */}

      <main className="flex-1 px-4">
        {/* ... header info ... */}

        {/* Chapter List */}
        <div className="animate-fadeIn">
          <ChapterList
            videos={playlist.videos}
            currentVideoIndex={currentVideoIndex}
            onVideoSelect={setCurrentVideoIndex}
            onDeleteVideo={handleDeleteVideo}
          />
        </div>
      </main>

      {/* Audio Player */}
      <AudioPlayer
        videos={playlist.videos}
        currentVideoIndex={currentVideoIndex}
        onVideoChange={setCurrentVideoIndex}
      />
    </div>
  );
}
