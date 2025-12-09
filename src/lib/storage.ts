// localStorage utilities for managing playlist history

import { Playlist } from "./types";
import { safeJSONParse, safeJSONStringify } from "./utils";

const STORAGE_KEY = "audiobook_playlists";

export const storage = {
  // Get all saved playlists
  getPlaylists: (): Playlist[] => {
    return safeJSONParse<Playlist[]>(STORAGE_KEY, []);
  },

  // Save a new playlist
  savePlaylist: (playlist: Playlist): void => {
    const playlists = storage.getPlaylists();
    // Check if playlist already exists
    const existingIndex = playlists.findIndex((p) => p.id === playlist.id);

    if (existingIndex >= 0) {
      // Update existing playlist
      playlists[existingIndex] = playlist;
    } else {
      // Add new playlist to the beginning
      playlists.unshift(playlist);
    }

    safeJSONStringify(STORAGE_KEY, playlists);
  },

  // Get a specific playlist by ID
  getPlaylist: (id: string): Playlist | null => {
    const playlists = storage.getPlaylists();
    return playlists.find((p) => p.id === id) || null;
  },

  // Delete a playlist
  deletePlaylist: (id: string): void => {
    const playlists = storage.getPlaylists();
    const filtered = playlists.filter((p) => p.id !== id);
    safeJSONStringify(STORAGE_KEY, filtered);
  },

  // Clear all playlists
  clearAll: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  // Remove a video from a playlist
  removeVideo: (playlistId: string, videoId: string): void => {
    const playlists = storage.getPlaylists();
    const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

    if (playlistIndex >= 0) {
      const playlist = playlists[playlistIndex];
      playlist.videos = playlist.videos.filter((v) => v.id !== videoId);
      playlist.videoCount = playlist.videos.length;

      // Update playlist in array
      playlists[playlistIndex] = playlist;
      safeJSONStringify(STORAGE_KEY, playlists);
    }
  },
};
