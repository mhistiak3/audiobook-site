// Hybrid storage that uses localStorage when not logged in or offline, Supabase when logged in and online

import { isOnline } from "@/hooks/useNetworkStatus";
import { storage } from "./storage";
import { createClient } from "./supabase/client";
import { Playlist } from "./types";

interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  lastPlayed: string;
  watched: boolean;
}

// Helper to check if we should use Supabase (logged in AND online)
async function shouldUseSupabase(): Promise<{
  useSupabase: boolean;
  user: any;
}> {
  // If offline, always use localStorage
  if (!isOnline()) {
    return { useSupabase: false, user: null };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, use localStorage
  if (!user) {
    return { useSupabase: false, user: null };
  }

  return { useSupabase: true, user };
}

export const hybridStorage = {
  // Get all saved playlists
  getPlaylists: async (): Promise<Playlist[]> => {
    const { useSupabase, user } = await shouldUseSupabase();

    if (!useSupabase) {
      // Offline or not logged in - use localStorage
      return storage.getPlaylists();
    }

    // Online and logged in - use Supabase
    try {
      const supabase = createClient();
      const { data: playlists, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("date_added", { ascending: false });

      if (error && Object.keys(error).length > 0) {
        console.error("Error fetching playlists:", error);
        // Fall back to localStorage on error
        return storage.getPlaylists();
      }

      // Fetch videos for each playlist
      const playlistsWithVideos = await Promise.all(
        (playlists || []).map(async (playlist) => {
          const { data: videos } = await supabase
            .from("videos")
            .select("*")
            .eq("playlist_id", playlist.id)
            .eq("user_id", user.id);

          return {
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            thumbnail: playlist.thumbnail,
            videoCount: playlist.video_count,
            url: playlist.url,
            dateAdded: playlist.date_added,
            videos: (videos || []).map((v) => ({
              id: v.id,
              title: v.title,
              thumbnail: v.thumbnail,
              duration: v.duration,
              durationSeconds: v.duration_seconds,
            })),
          };
        })
      );

      return playlistsWithVideos;
    } catch (error) {
      console.error("Error fetching playlists from Supabase:", error);
      // Fall back to localStorage on network error
      return storage.getPlaylists();
    }
  },

  // Save a playlist
  savePlaylist: async (playlist: Playlist): Promise<void> => {
    const { useSupabase, user } = await shouldUseSupabase();

    // Always save to localStorage first (for offline access)
    storage.savePlaylist(playlist);

    if (!useSupabase) {
      // Offline or not logged in - localStorage only
      return;
    }

    // Online and logged in - also save to Supabase
    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("playlists")
        .select("id")
        .eq("id", playlist.id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await supabase
          .from("playlists")
          .update({
            title: playlist.title,
            description: playlist.description,
            thumbnail: playlist.thumbnail,
            video_count: playlist.videoCount,
            url: playlist.url,
          })
          .eq("id", playlist.id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("playlists").insert({
          id: playlist.id,
          user_id: user.id,
          title: playlist.title,
          description: playlist.description,
          thumbnail: playlist.thumbnail,
          video_count: playlist.videoCount,
          url: playlist.url,
          date_added: playlist.dateAdded,
        });
      }

      await supabase
        .from("videos")
        .delete()
        .eq("playlist_id", playlist.id)
        .eq("user_id", user.id);

      if (playlist.videos.length > 0) {
        await supabase.from("videos").insert(
          playlist.videos.map((video) => ({
            id: video.id,
            playlist_id: playlist.id,
            user_id: user.id,
            title: video.title,
            thumbnail: video.thumbnail,
            duration: video.duration,
            duration_seconds: video.durationSeconds,
          }))
        );
      }
    } catch (error) {
      console.error("Error saving playlist to Supabase:", error);
      // Already saved to localStorage, so we're fine
    }
  },

  // Get a specific playlist
  getPlaylist: async (id: string): Promise<Playlist | null> => {
    const { useSupabase, user } = await shouldUseSupabase();

    if (!useSupabase) {
      return storage.getPlaylist(id);
    }

    try {
      const supabase = createClient();
      const { data: playlist, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if ((error && Object.keys(error).length > 0) || !playlist) {
        return storage.getPlaylist(id);
      }

      const { data: videos } = await supabase
        .from("videos")
        .select("*")
        .eq("playlist_id", id)
        .eq("user_id", user.id);

      return {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        videoCount: playlist.video_count,
        url: playlist.url,
        dateAdded: playlist.date_added,
        videos: (videos || []).map((v) => ({
          id: v.id,
          title: v.title,
          thumbnail: v.thumbnail,
          duration: v.duration,
          durationSeconds: v.duration_seconds,
        })),
      };
    } catch (error) {
      console.error("Error fetching playlist from Supabase:", error);
      return storage.getPlaylist(id);
    }
  },

  // Delete a playlist
  deletePlaylist: async (id: string): Promise<void> => {
    const { useSupabase, user } = await shouldUseSupabase();

    // Always delete from localStorage
    storage.deletePlaylist(id);

    if (!useSupabase) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from("playlists")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error deleting playlist from Supabase:", error);
    }
  },

  // Remove video from playlist
  // Remove video from playlist
  removeVideo: async (playlistId: string, videoId: string): Promise<void> => {
    const { useSupabase, user } = await shouldUseSupabase();

    // Always remove from localStorage
    storage.removeVideo(playlistId, videoId);

    if (!useSupabase) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from("videos")
        .delete()
        .eq("id", videoId)
        .eq("playlist_id", playlistId)
        .eq("user_id", user.id);

      const { data: videos } = await supabase
        .from("videos")
        .select("id")
        .eq("playlist_id", playlistId)
        .eq("user_id", user.id);

      await supabase
        .from("playlists")
        .update({ video_count: videos?.length || 0 })
        .eq("id", playlistId)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error removing video from Supabase:", error);
    }
  },

  // Get video progress
  getVideoProgress: async (): Promise<Record<string, VideoProgress>> => {
    const { useSupabase, user } = await shouldUseSupabase();

    // Helper to get localStorage progress
    const getLocalProgress = (): Record<string, VideoProgress> => {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("audiobook_video_progress")
          : null;
      return stored ? JSON.parse(stored) : {};
    };

    if (!useSupabase) {
      return getLocalProgress();
    }

    try {
      const supabase = createClient();
      const { data: progress, error } = await supabase
        .from("video_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error && Object.keys(error).length > 0) {
        console.error("Error fetching video progress:", error);
        return getLocalProgress();
      }

      const progressMap: Record<string, VideoProgress> = {};
      (progress || []).forEach((p) => {
        progressMap[p.video_id] = {
          videoId: p.video_id,
          currentTime: p.progress_time,
          duration: p.duration,
          lastPlayed: p.last_played,
          watched: p.watched,
        };
      });

      return progressMap;
    } catch (error) {
      console.error("Error fetching video progress from Supabase:", error);
      return getLocalProgress();
    }
  },

  // Update video progress
  updateVideoProgress: async (
    videoId: string,
    playlistId: string,
    currentTime: number,
    duration: number,
    watched: boolean
  ): Promise<void> => {
    // Helper to save to localStorage
    const saveToLocalStorage = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("audiobook_video_progress");
        const progress = stored ? JSON.parse(stored) : {};
        progress[videoId] = {
          videoId,
          currentTime,
          duration,
          lastPlayed: new Date().toISOString(),
          watched,
        };
        localStorage.setItem(
          "audiobook_video_progress",
          JSON.stringify(progress)
        );
      }
    };

    // Always save to localStorage first
    saveToLocalStorage();

    const { useSupabase, user } = await shouldUseSupabase();

    if (!useSupabase) {
      return;
    }

    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("video_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .eq("playlist_id", playlistId)
        .single();

      if (existing) {
        await supabase
          .from("video_progress")
          .update({
            progress_time: currentTime,
            duration,
            watched,
            last_played: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("video_progress").insert({
          user_id: user.id,
          video_id: videoId,
          playlist_id: playlistId,
          progress_time: currentTime,
          duration,
          watched,
          last_played: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating video progress in Supabase:", error);
      // Already saved to localStorage
    }
  },

  // Clear video progress
  clearVideoProgress: async (videoId: string): Promise<void> => {
    // Helper to clear from localStorage
    const clearFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("audiobook_video_progress");
        const progress = stored ? JSON.parse(stored) : {};
        delete progress[videoId];
        localStorage.setItem(
          "audiobook_video_progress",
          JSON.stringify(progress)
        );
      }
    };

    // Always clear from localStorage
    clearFromLocalStorage();

    const { useSupabase, user } = await shouldUseSupabase();

    if (!useSupabase) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from("video_progress")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error clearing video progress from Supabase:", error);
    }
  },

  // Clear playlist progress
  clearPlaylistProgress: async (videoIds: string[]): Promise<void> => {
    // Helper to clear from localStorage
    const clearFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("audiobook_video_progress");
        const progress = stored ? JSON.parse(stored) : {};
        videoIds.forEach((videoId) => delete progress[videoId]);
        localStorage.setItem(
          "audiobook_video_progress",
          JSON.stringify(progress)
        );
      }
    };

    // Always clear from localStorage
    clearFromLocalStorage();

    const { useSupabase, user } = await shouldUseSupabase();

    if (!useSupabase) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from("video_progress")
        .delete()
        .in("video_id", videoIds)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error clearing playlist progress from Supabase:", error);
    }
  },

  // Sync localStorage data to Supabase (called on login)
  syncLocalToSupabase: async (): Promise<void> => {
    // Only sync if online
    if (!isOnline()) {
      console.log("Offline - skipping sync to Supabase");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      // Get localStorage data
      const localPlaylists = storage.getPlaylists();

      // Get video progress from localStorage
      let localProgress: Record<
        string,
        {
          playlistId: string;
          currentTime: number;
          duration: number;
          watched: boolean;
          lastPlayed: string;
        }
      > = {};

      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("audiobook_video_progress");
          if (stored) {
            localProgress = JSON.parse(stored);
          }
        } catch (error) {
          console.error("Error reading localStorage progress:", error);
        }
      }

      // Batch all operations together for better performance
      const syncOperations = [];

      // Prepare all playlist upserts
      if (localPlaylists.length > 0) {
        const playlistData = localPlaylists.map((playlist) => ({
          id: playlist.id,
          user_id: user.id,
          title: playlist.title,
          description: playlist.description,
          thumbnail: playlist.thumbnail,
          video_count: playlist.videoCount,
          url: playlist.url,
          date_added: playlist.dateAdded,
        }));

        syncOperations.push(supabase.from("playlists").upsert(playlistData));

        // Prepare all video upserts
        const allVideos = localPlaylists.flatMap((playlist) =>
          playlist.videos.map((video) => ({
            id: video.id,
            playlist_id: playlist.id,
            user_id: user.id,
            title: video.title,
            thumbnail: video.thumbnail,
            duration: video.duration,
            duration_seconds: video.durationSeconds,
          }))
        );

        if (allVideos.length > 0) {
          syncOperations.push(supabase.from("videos").upsert(allVideos));
        }
      }

      // Prepare all video progress upserts
      const progressEntries = Object.entries(localProgress);
      if (progressEntries.length > 0) {
        const progressData = progressEntries.map(([videoId, progress]) => ({
          user_id: user.id,
          video_id: videoId,
          playlist_id: progress.playlistId,
          progress_time: progress.currentTime,
          duration: progress.duration,
          watched: progress.watched,
          last_played: progress.lastPlayed,
        }));

        syncOperations.push(
          supabase.from("video_progress").upsert(progressData)
        );
      }

      // Execute all operations in parallel
      await Promise.all(syncOperations);
    } catch (error) {
      console.error("Error syncing localStorage to Supabase:", error);
    }
  },

  // Sync Supabase data to localStorage (called on logout)
  syncSupabaseToLocal: async (): Promise<void> => {
    // Only sync if online
    if (!isOnline()) {
      console.log("Offline - skipping sync from Supabase");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      // Get all playlists from Supabase
      const supabasePlaylists = await hybridStorage.getPlaylists();

      // Save to localStorage
      supabasePlaylists.forEach((playlist) => {
        storage.savePlaylist(playlist);
      });

      // Get all video progress from Supabase
      const supabaseProgress = await hybridStorage.getVideoProgress();

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "audiobook_video_progress",
          JSON.stringify(supabaseProgress)
        );
      }
    } catch (error) {
      console.error("Error syncing Supabase to localStorage:", error);
    }
  },
};
