"use client";

import { useState } from "react";
import { fetchPlaylist } from "@/lib/youtube";
import { storage } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { Search, Loader2, Plus } from "lucide-react";

export default function PlaylistInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a YouTube playlist URL");
      return;
    }

    setLoading(true);

    try {
      const playlist = await fetchPlaylist(url);
      storage.savePlaylist(playlist);
      router.push(`/playlist/${playlist.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube Playlist URL"
            className="w-full bg-[#282828] text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-500 text-sm font-medium"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="mt-4 w-full bg-[#1DB954] text-black font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <Plus size={20} strokeWidth={3} />
              <span>Add to Library</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
