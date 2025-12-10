"use client";

import PlaylistCard from "@/components/PlaylistCard";
import PlaylistInput from "@/components/PlaylistInput";
import VideoInput from "@/components/VideoInput";
import { useAuth } from "@/context/AuthContext";
import { hybridStorage } from "@/lib/hybridStorage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearPlaylistProgress, setVideoProgress } from "@/store/playerSlice";
import { deletePlaylist, setPlaylists } from "@/store/playlistSlice";
import { ChevronDown, Download, Library, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TabType = "library" | "add-playlist" | "add-video";
type LibraryFilter = "all" | "playlists" | "videos";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Home() {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlists.playlists);
  const [activeTab, setActiveTab] = useState<TabType>("library");
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      if (!authLoading) {
        setLoading(true);
        const [playlistsData, progressData] = await Promise.all([
          hybridStorage.getPlaylists(),
          hybridStorage.getVideoProgress(),
        ]);
        dispatch(setPlaylists(playlistsData));
        dispatch(setVideoProgress(progressData));
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch, authLoading]);

  useEffect(() => {
    // Listen for PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Install outcome: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleDeletePlaylist = (id: string) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      // Get video IDs before deleting
      const playlist = playlists.find((p) => p.id === id);
      if (playlist) {
        const videoIds = playlist.videos.map((v) => v.id);
        // Clear progress for all videos in the playlist
        dispatch(clearPlaylistProgress(videoIds));
      }
      dispatch(deletePlaylist(id));
    }
  };

  // Filter playlists based on selected filter
  const filteredPlaylists = playlists.filter((playlist) => {
    if (libraryFilter === "all") return true;
    if (libraryFilter === "playlists") return playlist.videoCount > 1;
    if (libraryFilter === "videos") return playlist.videoCount === 1;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-hover to-surface min-h-screen pb-24">
      {/* Header */}
      <header className="pt-[var(--safe-top)] px-6 pb-4 sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="iAudioBook"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-foreground">iAudioBook</h1>
          </div>
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button
                onClick={handleInstallApp}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                title="Install App"
              >
                <Download size={20} className="text-primary" />
              </button>
            )}
            {user ? (
              <>
                <button
                  onClick={signOut}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={20} className="text-muted" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-primary text-dark font-semibold rounded-full hover:bg-primary-hover transition-colors text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-4 flex gap-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("library")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "library"
              ? "bg-white text-black"
              : "bg-secondary text-white"
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setActiveTab("add-playlist")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "add-playlist"
              ? "bg-white text-black"
              : "bg-secondary text-white"
          }`}
        >
          Add Playlist
        </button>
        <button
          onClick={() => setActiveTab("add-video")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === "add-video"
              ? "bg-white text-black"
              : "bg-secondary text-white"
          }`}
        >
          Add Video
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted">Loading...</div>
          </div>
        ) : activeTab === "add-playlist" ? (
          <div className="animate-fadeIn py-4">
            <h2 className="text-xl font-bold text-white mb-2 px-2">
              Add Playlist
            </h2>
            <p className="text-gray-400 text-sm mb-6 px-2">
              Paste a YouTube playlist URL to import it as an audiobook.
            </p>
            <PlaylistInput />
          </div>
        ) : activeTab === "add-video" ? (
          <div className="animate-fadeIn py-4">
            <h2 className="text-xl font-bold text-white mb-2 px-2">
              Add Single Video
            </h2>
            <p className="text-gray-400 text-sm mb-6 px-2">
              Paste a YouTube video URL to add it to your library.
            </p>
            <VideoInput />
          </div>
        ) : (
          <div className="animate-fadeIn py-2">
            {playlists.length > 0 ? (
              <>
                {/* Filter Dropdown */}
                <div className="mb-4 px-2">
                  <div className="relative inline-block">
                    <select
                      value={libraryFilter}
                      onChange={(e) =>
                        setLibraryFilter(e.target.value as LibraryFilter)
                      }
                      className="appearance-none bg-secondary text-white px-4 py-2 pr-10 rounded-lg text-sm font-medium cursor-pointer hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">
                        All Items ({playlists.length})
                      </option>
                      <option value="playlists">
                        Playlists (
                        {playlists.filter((p) => p.videoCount > 1).length})
                      </option>
                      <option value="videos">
                        Videos (
                        {playlists.filter((p) => p.videoCount === 1).length})
                      </option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  {filteredPlaylists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onDelete={() => handleDeletePlaylist(playlist.id)}
                    />
                  ))}
                </div>
              </>
            ) : filteredPlaylists.length === 0 ? (
              <div className="text-center py-12 px-6">
                <p className="text-gray-400 text-sm">
                  No{" "}
                  {libraryFilter === "playlists"
                    ? "playlists"
                    : libraryFilter === "videos"
                    ? "videos"
                    : "items"}{" "}
                  found
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Library size={32} className="text-gray-500" />
                </div>
                <h3 className="text-white font-bold mb-2">
                  Your library is empty
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Import a YouTube playlist or video to get started.
                </p>
                <button
                  onClick={() => setActiveTab("add-playlist")}
                  className="px-6 py-3 bg-light text-dark rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
