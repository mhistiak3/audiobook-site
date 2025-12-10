import { hybridStorage } from "@/lib/hybridStorage";
import { isVideoWatched } from "@/lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  lastPlayed: string;
  watched: boolean;
}

interface PlayerState {
  currentVideoId: string | null;
  currentVideoIndex: number;
  isPlaying: boolean;
  videoProgress: Record<string, VideoProgress>; // videoId -> progress
  currentPlaylistId: string | null;
}

const initialState: PlayerState = {
  currentVideoId: null,
  currentVideoIndex: 0,
  isPlaying: false,
  videoProgress: {},
  currentPlaylistId: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setCurrentVideo: (
      state,
      action: PayloadAction<{ videoId: string; index: number }>
    ) => {
      state.currentVideoId = action.payload.videoId;
      state.currentVideoIndex = action.payload.index;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setVideoProgress: (
      state,
      action: PayloadAction<Record<string, VideoProgress>>
    ) => {
      state.videoProgress = action.payload;
    },
    updateVideoProgress: (
      state,
      action: PayloadAction<{
        videoId: string;
        playlistId: string;
        currentTime: number;
        duration: number;
      }>
    ) => {
      const { videoId, playlistId, currentTime, duration } = action.payload;
      const watched = isVideoWatched(currentTime, duration);

      state.videoProgress[videoId] = {
        videoId,
        currentTime,
        duration,
        lastPlayed: new Date().toISOString(),
        watched,
      };

      // Save to storage
      hybridStorage.updateVideoProgress(
        videoId,
        playlistId,
        currentTime,
        duration,
        watched
      );
    },
    markAsWatched: (
      state,
      action: PayloadAction<{ videoId: string; playlistId: string }>
    ) => {
      const { videoId, playlistId } = action.payload;
      if (state.videoProgress[videoId]) {
        state.videoProgress[videoId].watched = true;
        const progress = state.videoProgress[videoId];
        hybridStorage.updateVideoProgress(
          videoId,
          playlistId,
          progress.currentTime,
          progress.duration,
          true
        );
      }
    },
    clearVideoProgress: (state, action: PayloadAction<string>) => {
      delete state.videoProgress[action.payload];
      hybridStorage.clearVideoProgress(action.payload);
    },
    clearPlaylistProgress: (state, action: PayloadAction<string[]>) => {
      // Clear progress for multiple videos (when playlist is deleted)
      action.payload.forEach((videoId) => {
        delete state.videoProgress[videoId];
      });
      hybridStorage.clearPlaylistProgress(action.payload);
    },
    setCurrentVideoIndex: (state, action: PayloadAction<number>) => {
      state.currentVideoIndex = action.payload;
    },
    setCurrentPlaylistId: (state, action: PayloadAction<string | null>) => {
      state.currentPlaylistId = action.payload;
    },
  },
});

export const {
  setCurrentVideo,
  setIsPlaying,
  setVideoProgress,
  updateVideoProgress,
  markAsWatched,
  clearVideoProgress,
  clearPlaylistProgress,
  setCurrentVideoIndex,
  setCurrentPlaylistId,
} = playerSlice.actions;

export default playerSlice.reducer;
