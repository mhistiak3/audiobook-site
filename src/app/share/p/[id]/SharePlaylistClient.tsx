"use client";

import { useAuth } from "@/context/AuthContext";
import { hybridStorage } from "@/lib/hybridStorage";
import { Playlist } from "@/lib/types";
import { fetchPlaylistById } from "@/lib/youtube";
import { useAppDispatch } from "@/store/hooks";
import { setVideoProgress } from "@/store/playerSlice";
import { addPlaylist, setPlaylists } from "@/store/playlistSlice";
import { CheckCircle, Loader2, Music2, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ShareStatus = "loading" | "adding" | "success" | "error" | "exists";

interface SharePlaylistClientProps {
  playlistId: string;
}

export default function SharePlaylistClient({
  playlistId,
}: SharePlaylistClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useAuth();

  const [status, setStatus] = useState<ShareStatus>("loading");
  const [error, setError] = useState<string>("");
  const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const handleSharedPlaylist = async () => {
      // Prevent running multiple times
      if (hasRun.current || authLoading) return;
      hasRun.current = true;

      // Load existing playlists
      const [playlistsData, progressData] = await Promise.all([
        hybridStorage.getPlaylists(),
        hybridStorage.getVideoProgress(),
      ]);
      dispatch(setPlaylists(playlistsData));
      dispatch(setVideoProgress(progressData));

      // Check if playlist already exists in library
      const existingPlaylist = playlistsData.find((p) => p.id === playlistId);
      if (existingPlaylist) {
        setPlaylistData(existingPlaylist);
        setStatus("exists");
        // Navigate to playlist after short delay
        setTimeout(() => {
          router.replace(`/playlist/${playlistId}`);
        }, 1500);
        return;
      }

      // Fetch and add playlist
      setStatus("adding");
      try {
        const playlist = await fetchPlaylistById(playlistId);
        setPlaylistData(playlist);
        dispatch(addPlaylist(playlist));
        setStatus("success");

        // Navigate to playlist after short delay
        setTimeout(() => {
          router.replace(`/playlist/${playlistId}`);
        }, 1500);
      } catch (err) {
        console.error("Error adding shared playlist:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load playlist",
        );
        setStatus("error");
      }
    };

    handleSharedPlaylist();
  }, [playlistId, authLoading, dispatch, router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        {/* Playlist Preview Card */}
        <div className="bg-card rounded-2xl p-6 shadow-xl mb-6">
          {playlistData ? (
            <>
              <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden mb-4 shadow-lg">
                <Image
                  src={playlistData.thumbnail}
                  alt={playlistData.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 line-clamp-2">
                {playlistData.title}
              </h2>
              <p className="text-muted text-sm">
                {playlistData.videoCount} chapters
              </p>
            </>
          ) : (
            <div className="w-32 h-32 mx-auto rounded-lg bg-hover flex items-center justify-center mb-4">
              <Music2 size={48} className="text-muted" />
            </div>
          )}

          {/* Status Display */}
          <div className="mt-4">
            {(status === "loading" || status === "adding") && (
              <div className="flex items-center justify-center gap-3 text-muted">
                <Loader2 size={24} className="animate-spin text-primary" />
                <span>
                  {status === "loading"
                    ? "Loading..."
                    : "Adding to your library..."}
                </span>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center justify-center gap-3 text-primary">
                <CheckCircle size={24} />
                <span>Added to library! Redirecting...</span>
              </div>
            )}

            {status === "exists" && (
              <div className="flex items-center justify-center gap-3 text-primary">
                <CheckCircle size={24} />
                <span>Already in your library! Opening...</span>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 text-error mb-4">
                  <XCircle size={24} />
                  <span>Failed to load</span>
                </div>
                <p className="text-sm text-muted mb-4">{error}</p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-primary text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
                >
                  Go to Library
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shared via text */}
        <p className="text-muted text-sm">Shared via Audiobook Player</p>
      </div>
    </div>
  );
}
