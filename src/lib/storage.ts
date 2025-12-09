// localStorage utilities for managing playlist history

import { Playlist } from "./types";

const STORAGE_KEY = "audiobook_playlists";

export const storage = {
  // Get all saved playlists
  getPlaylists: (): Playlist[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  // Save a new playlist
  savePlaylist: (playlist: Playlist): void => {
    if (typeof window === "undefined") return;
    try {
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

      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  // Get a specific playlist by ID
  getPlaylist: (id: string): Playlist | null => {
    const playlists = storage.getPlaylists();
    return playlists.find((p) => p.id === id) || null;
  },

  // Delete a playlist
  deletePlaylist: (id: string): void => {
    if (typeof window === "undefined") return;
    try {
      const playlists = storage.getPlaylists();
      const filtered = playlists.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting from localStorage:", error);
    }
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
    if (typeof window === "undefined") return;
    try {
      const playlists = storage.getPlaylists();
      const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

      if (playlistIndex >= 0) {
        const playlist = playlists[playlistIndex];
        playlist.videos = playlist.videos.filter((v) => v.id !== videoId);
        playlist.videoCount = playlist.videos.length;

        // Update playlist in array
        playlists[playlistIndex] = playlist;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
      }
    } catch (error) {
      console.error("Error removing video from localStorage:", error);
    }
  },
};
