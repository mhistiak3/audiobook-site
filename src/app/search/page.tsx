"use client";

import { SearchResult, fetchSingleVideo, searchVideos } from "@/lib/youtube";
import { useAppDispatch } from "@/store/hooks";
import { addPlaylist } from "@/store/playlistSlice";
import {
  ChevronLeft,
  Loader2,
  Play,
  Plus,
  Search as SearchIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const data = await searchVideos(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search videos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (video: SearchResult) => {
    setAddingId(video.id);
    try {
      // Create a full YouTube URL for the fetchSingleVideo function
      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
      const fullVideoData = await fetchSingleVideo(videoUrl);
      dispatch(addPlaylist(fullVideoData));

      // Redirect to the new video
      router.push(`/playlist/${fullVideoData.id}`);
    } catch (err) {
      console.error("Failed to add video:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add video to library",
      );
      setAddingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-hover to-surface pb-24">
      {/* Header */}
      <div className="pt-(--safe-top) px-4 pb-4 sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 pt-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Search YouTube</h1>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon size={20} className="text-gray-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search audiobooks, podcasts... (Press Enter)"
            className="w-full bg-secondary text-foreground pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder-muted text-sm font-medium"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {loading ? (
              <Loader2 size={18} className="text-primary animate-spin mr-2" />
            ) : (
              query.trim() && (
                <button
                  type="submit"
                  className="p-2 bg-primary rounded-lg text-black hover:scale-105 transition-transform"
                >
                  <SearchIcon size={16} strokeWidth={3} />
                </button>
              )
            )}
          </div>
        </form>
      </div>

      <div className="flex-1 px-4 py-2">
        {error && (
          <div className="mb-4 p-3 bg-error-bg border border-error-border rounded-lg text-error text-xs">
            {error}
          </div>
        )}

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((video, index) => (
              <div
                // Fallback to index if video.id is duplicate, though ideal is unique IDs
                key={`${video.id}-${index}`}
                className="flex gap-3 p-3 bg-secondary/50 rounded-xl border border-white/5 hover:bg-secondary transition-colors group"
              >
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0 bg-black/20">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={24} className="text-white fill-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3
                      className="text-sm font-medium text-white line-clamp-2 leading-tight mb-1"
                      dangerouslySetInnerHTML={{ __html: video.title }}
                    />
                    <p className="text-xs text-muted truncate">
                      {video.channelTitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => handleAddVideo(video)}
                      disabled={addingId === video.id}
                      className="self-start text-xs font-bold bg-white/10 hover:bg-primary hover:text-black text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingId === video.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} strokeWidth={3} />
                      )}
                      {addingId === video.id ? "Adding..." : "Add to Library"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          query.trim() &&
          results.length === 0 && (
            <div className="text-center py-20 text-muted text-sm">
              Press Enter to search for "{query}"
            </div>
          )
        )}

        {!query.trim() && !loading && (
          <div className="text-center py-20 text-muted/50 text-sm">
            Type and press Enter to find audiobooks
          </div>
        )}
      </div>
    </div>
  );
}
