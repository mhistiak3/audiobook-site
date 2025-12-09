// Type definitions for the audiobook application

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string; // Format: "HH:MM:SS" or "MM:SS"
  durationSeconds: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoCount: number;
  videos: Video[];
  url: string;
  dateAdded: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  currentVideoIndex: number;
}
