"use client";

import { useAuth } from "@/context/AuthContext";
import { Bookmark as BookmarkType } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";
import { Bookmark, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const playlists = useAppSelector((state) => state.playlists.playlists);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const mounted = true;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    // Load bookmarks from localStorage
    const loadBookmarks = () => {
      try {
        const saved = localStorage.getItem("audiobook_bookmarks");
        if (saved) {
          const parsed = JSON.parse(saved);
          setBookmarks(
            parsed.sort(
              (a: BookmarkType, b: BookmarkType) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
          );
        }
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
      }
    };

    if (mounted) {
      loadBookmarks();
    }
  }, [mounted]);

  const deleteBookmark = (id: string) => {
    if (confirm("Delete this bookmark?")) {
      const updated = bookmarks.filter((b) => b.id !== id);
      setBookmarks(updated);
      localStorage.setItem("audiobook_bookmarks", JSON.stringify(updated));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getVideoTitle = (videoId: string) => {
    for (const playlist of playlists) {
      const video = playlist.videos.find((v) => v.id === videoId);
      if (video) return video.title;
    }
    return "Unknown Video";
  };

  const jumpToBookmark = (bookmark: BookmarkType) => {
    // Find the playlist containing this video
    const playlist = playlists.find((p) =>
      p.videos.some((v) => v.id === bookmark.videoId)
    );

    if (playlist) {
      // Navigate to playlist page with query params
      router.push(
        `/playlist/${playlist.id}?video=${bookmark.videoId}&time=${bookmark.time}`
      );
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-hover to-surface pb-24">
      {/* Header */}
      <header className="pt-[var(--safe-top)] px-6 pb-6 sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-white/5">
        <div className="pt-4">
          <h1 className="text-2xl font-bold">Bookmarks</h1>
          <p className="text-muted text-sm mt-1">
            {bookmarks.length} saved moments
          </p>
        </div>
      </header>

      <div className="px-6 py-6">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bookmark className="text-muted mb-4" size={48} />
            <h3 className="font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted text-sm max-w-[260px]">
              Add bookmarks while listening to save important moments
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-secondary rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => jumpToBookmark(bookmark)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 truncate">
                      {getVideoTitle(bookmark.videoId)}
                    </h4>
                    {bookmark.note && (
                      <p className="text-muted text-sm mb-2 line-clamp-2">
                        {bookmark.note}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(bookmark.time)}
                      </span>
                      <span>
                        {new Date(bookmark.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBookmark(bookmark.id);
                    }}
                    className="text-muted hover:text-error transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
