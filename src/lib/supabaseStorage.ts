// Supabase storage utilities for managing playlists and video progress

import { createClient } from "./supabase/client";
import { Playlist } from "./types";

interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  lastPlayed: string;
  watched: boolean;
}

export const supabaseStorage = {
  // Get all saved playlists for the current user
  getPlaylists: async (): Promise<Playlist[]> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return [];

    const { data: playlists, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", user.user.id)
      .order("date_added", { ascending: false });

    if (error) {
      console.error("Error fetching playlists:", error);
      return [];
    }

    // Fetch videos for each playlist
    const playlistsWithVideos = await Promise.all(
      (playlists || []).map(async (playlist) => {
        const { data: videos } = await supabase
          .from("videos")
          .select("*")
          .eq("playlist_id", playlist.id)
          .eq("user_id", user.user.id);

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
  },

  // Save a new playlist
  savePlaylist: async (playlist: Playlist): Promise<void> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    // Check if playlist exists
    const { data: existing } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", playlist.id)
      .eq("user_id", user.user.id)
      .single();

    if (existing) {
      // Update existing playlist
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
        .eq("user_id", user.user.id);
    } else {
      // Insert new playlist
      await supabase.from("playlists").insert({
        id: playlist.id,
        user_id: user.user.id,
        title: playlist.title,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        video_count: playlist.videoCount,
        url: playlist.url,
        date_added: playlist.dateAdded,
      });
    }

    // Delete existing videos for this playlist
    await supabase
      .from("videos")
      .delete()
      .eq("playlist_id", playlist.id)
      .eq("user_id", user.user.id);

    // Insert videos
    if (playlist.videos.length > 0) {
      await supabase.from("videos").insert(
        playlist.videos.map((video) => ({
          id: video.id,
          playlist_id: playlist.id,
          user_id: user.user.id,
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          duration_seconds: video.durationSeconds,
        }))
      );
    }
  },

  // Get a specific playlist by ID
  getPlaylist: async (id: string): Promise<Playlist | null> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data: playlist, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.user.id)
      .single();

    if (error || !playlist) {
      console.error("Error fetching playlist:", error);
      return null;
    }

    const { data: videos } = await supabase
      .from("videos")
      .select("*")
      .eq("playlist_id", id)
      .eq("user_id", user.user.id);

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
  },

  // Delete a playlist
  deletePlaylist: async (id: string): Promise<void> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    await supabase
      .from("playlists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id);
  },

  // Remove a video from a playlist
  removeVideo: async (playlistId: string, videoId: string): Promise<void> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    // Delete the video
    await supabase
      .from("videos")
      .delete()
      .eq("id", videoId)
      .eq("playlist_id", playlistId)
      .eq("user_id", user.user.id);

    // Update playlist video count
    const { data: videos } = await supabase
      .from("videos")
      .select("id")
      .eq("playlist_id", playlistId)
      .eq("user_id", user.user.id);

    await supabase
      .from("playlists")
      .update({ video_count: videos?.length || 0 })
      .eq("id", playlistId)
      .eq("user_id", user.user.id);
  },

  // Get video progress
  getVideoProgress: async (): Promise<Record<string, VideoProgress>> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return {};

    const { data: progress, error } = await supabase
      .from("video_progress")
      .select("*")
      .eq("user_id", user.user.id);

    if (error) {
      console.error("Error fetching video progress:", error);
      return {};
    }

    const progressMap: Record<string, VideoProgress> = {};
    (progress || []).forEach((p) => {
      progressMap[p.video_id] = {
        videoId: p.video_id,
        currentTime: p.current_time,
        duration: p.duration,
        lastPlayed: p.last_played,
        watched: p.watched,
      };
    });

    return progressMap;
  },

  // Update video progress
  updateVideoProgress: async (
    videoId: string,
    playlistId: string,
    currentTime: number,
    duration: number,
    watched: boolean
  ): Promise<void> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data: existing } = await supabase
      .from("video_progress")
      .select("id")
      .eq("user_id", user.user.id)
      .eq("video_id", videoId)
      .eq("playlist_id", playlistId)
      .single();

    if (existing) {
      // Update existing progress
      await supabase
        .from("video_progress")
        .update({
          current_time: currentTime,
          duration,
          watched,
          last_played: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insert new progress
      await supabase.from("video_progress").insert({
        user_id: user.user.id,
        video_id: videoId,
        playlist_id: playlistId,
        current_time: currentTime,
        duration,
        watched,
        last_played: new Date().toISOString(),
      });
    }
  },

  // Clear video progress
  clearVideoProgress: async (videoId: string): Promise<void> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    await supabase
      .from("video_progress")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", user.user.id);
  },

  // Clear playlist progress (all videos in a playlist)
  clearPlaylistProgress: async (videoIds: string[]): Promise<void> => {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    await supabase
      .from("video_progress")
      .delete()
      .in("video_id", videoIds)
      .eq("user_id", user.user.id);
  },
};
