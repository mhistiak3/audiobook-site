"use client";

import PlaylistCard from "@/components/PlaylistCard";
import PlaylistInput from "@/components/PlaylistInput";
import VideoInput from "@/components/VideoInput";
import { storage } from "@/lib/storage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deletePlaylist, setPlaylists } from "@/store/playlistSlice";
import { Library } from "lucide-react";
import { useEffect, useState } from "react";

type TabType = "library" | "add-playlist" | "add-video";

export default function Home() {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlists.playlists);
  const [activeTab, setActiveTab] = useState<TabType>("library");

  useEffect(() => {
    dispatch(setPlaylists(storage.getPlaylists()));
  }, [dispatch]);

  const handleDeletePlaylist = (id: string) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      dispatch(deletePlaylist(id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-[#1a1a1a] to-[#121212] min-h-screen pb-24">
      {/* Header */}
      <header className="pt-[var(--safe-top)] px-6 pb-4 sticky top-0 z-10 bg-[#121212]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between pt-4">
          <h1 className="text-2xl font-bold text-white">Audiobook</h1>
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-xs">
            AB
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
        {activeTab === "add-playlist" ? (
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
              <div className="space-y-1">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={() => handleDeletePlaylist(playlist.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mb-4">
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
                  className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform"
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
