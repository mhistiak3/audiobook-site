"use client";

import { useEffect, useState } from "react";
import PlaylistInput from "@/components/PlaylistInput";
import PlaylistCard from "@/components/PlaylistCard";
import { storage } from "@/lib/storage";
import { Playlist } from "@/lib/types";
import { Library, Plus } from "lucide-react";

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "add">("library");

  useEffect(() => {
    setPlaylists(storage.getPlaylists());
  }, []);

  const handleDeletePlaylist = (id: string) => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      storage.deletePlaylist(id);
      setPlaylists(storage.getPlaylists());
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
      <div className="px-6 py-4 flex gap-4">
        <button
          onClick={() => setActiveTab("library")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "library"
              ? "bg-white text-black"
              : "bg-secondary text-white"
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "add"
              ? "bg-white text-black"
              : "bg-secondary text-white"
          }`}
        >
          Add New
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 px-4">
        {activeTab === "add" ? (
          <div className="animate-fadeIn py-4">
            <h2 className="text-xl font-bold text-white mb-2 px-2">
              Add Playlist
            </h2>
            <p className="text-gray-400 text-sm mb-6 px-2">
              Paste a YouTube playlist URL to import it as an audiobook.
            </p>
            <PlaylistInput />
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
                  Import a YouTube playlist to get started.
                </p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  Import Playlist
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
