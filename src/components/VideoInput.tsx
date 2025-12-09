"use client";

import { fetchSingleVideo } from "@/lib/youtube";
import { useAppDispatch } from "@/store/hooks";
import { addPlaylist } from "@/store/playlistSlice";
import { Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VideoInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a YouTube video URL");
      return;
    }

    setLoading(true);

    try {
      const video = await fetchSingleVideo(url);
      dispatch(addPlaylist(video));
      router.push(`/playlist/${video.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load video");
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
            placeholder="Paste YouTube Video URL"
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
