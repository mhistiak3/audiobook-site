"use client";

import AudioPlayer from "@/components/AudioPlayer";
import ChapterList from "@/components/ChapterList";
import { hybridStorage } from "@/lib/hybridStorage";
import { Playlist } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearVideoProgress,
  setCurrentVideoIndex,
  setVideoProgress,
} from "@/store/playerSlice";
import { removeVideoFromPlaylist, setPlaylists } from "@/store/playlistSlice";
import { ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlists.playlists);
  const currentVideoIndex = useAppSelector(
    (state) => state.player.currentVideoIndex
  );

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load playlists into Redux if not already loaded
      if (playlists.length === 0) {
        const [playlistsData, progressData] = await Promise.all([
          hybridStorage.getPlaylists(),
          hybridStorage.getVideoProgress(),
        ]);
        dispatch(setPlaylists(playlistsData));
        dispatch(setVideoProgress(progressData));
      }

      const loadedPlaylist = await hybridStorage.getPlaylist(playlistId);
      if (!loadedPlaylist) {
        router.push("/");
        return;
      }
      setPlaylist(loadedPlaylist);
      setLoading(false);
    };

    loadData();
  }, [playlistId, router, dispatch, playlists.length]);

  if (loading || !playlist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const totalDuration = Math.floor(
    playlist.videos.reduce((acc, v) => acc + v.durationSeconds, 0) / 60
  );

  const handleDeleteVideo = async (videoId: string) => {
    if (confirm("Remove this chapter from playlist?")) {
      // Clear video progress from Supabase
      dispatch(clearVideoProgress(videoId));

      // Remove video from playlist
      dispatch(removeVideoFromPlaylist({ playlistId, videoId }));

      // Refresh playlist
      const updated = await hybridStorage.getPlaylist(playlistId);
      if (updated) {
        setPlaylist(updated);
        // Adjust current index if needed
        if (currentVideoIndex >= updated.videos.length) {
          dispatch(
            setCurrentVideoIndex(Math.max(0, updated.videos.length - 1))
          );
        }
      }
    }
  };

  const handleVideoSelect = (index: number) => {
    dispatch(setCurrentVideoIndex(index));
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-24">
      {/* Header with Back Button */}
      <header className="pt-[var(--safe-top)] px-4 pb-4 sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            aria-label="Back to library"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white truncate flex-1">
            {playlist.title}
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        {/* Playlist Info */}
        <div className="mb-6">
          <div className="relative w-full aspect-square max-w-xs mx-auto rounded-lg overflow-hidden shadow-xl mb-4">
            <Image
              src={playlist.thumbnail}
              alt={playlist.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="text-center px-2">
            <h2 className="text-2xl font-bold text-white mb-2">
              {playlist.title}
            </h2>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
              <span>{playlist.videoCount} chapters</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{totalDuration} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="animate-fadeIn">
          <h3 className="text-lg font-bold text-white mb-3 px-2">Chapters</h3>
          <ChapterList
            videos={playlist.videos}
            currentVideoIndex={currentVideoIndex}
            onVideoSelect={handleVideoSelect}
            onDeleteVideo={handleDeleteVideo}
          />
        </div>
      </main>

      {/* Audio Player */}
      <AudioPlayer
        videos={playlist.videos}
        currentVideoIndex={currentVideoIndex}
        onVideoChange={handleVideoSelect}
        playlistId={playlistId}
      />
    </div>
  );
}
