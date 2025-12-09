import { isVideoWatched, safeJSONParse, safeJSONStringify } from "@/lib/utils";
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
}

const PROGRESS_STORAGE_KEY = "audiobook_video_progress";

// Load progress from localStorage
const loadProgressFromStorage = (): Record<string, VideoProgress> => {
  return safeJSONParse<Record<string, VideoProgress>>(PROGRESS_STORAGE_KEY, {});
};

// Save progress to localStorage
const saveProgressToStorage = (progress: Record<string, VideoProgress>) => {
  safeJSONStringify(PROGRESS_STORAGE_KEY, progress);
};

const initialState: PlayerState = {
  currentVideoId: null,
  currentVideoIndex: 0,
  isPlaying: false,
  videoProgress: loadProgressFromStorage(),
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
    updateVideoProgress: (
      state,
      action: PayloadAction<{
        videoId: string;
        currentTime: number;
        duration: number;
      }>
    ) => {
      const { videoId, currentTime, duration } = action.payload;
      const watched = isVideoWatched(currentTime, duration);

      state.videoProgress[videoId] = {
        videoId,
        currentTime,
        duration,
        lastPlayed: new Date().toISOString(),
        watched,
      };

      // Save to localStorage
      saveProgressToStorage(state.videoProgress);
    },
    markAsWatched: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      if (state.videoProgress[videoId]) {
        state.videoProgress[videoId].watched = true;
        saveProgressToStorage(state.videoProgress);
      }
    },
    clearVideoProgress: (state, action: PayloadAction<string>) => {
      delete state.videoProgress[action.payload];
      saveProgressToStorage(state.videoProgress);
    },
    clearPlaylistProgress: (state, action: PayloadAction<string[]>) => {
      // Clear progress for multiple videos (when playlist is deleted)
      action.payload.forEach((videoId) => {
        delete state.videoProgress[videoId];
      });
      saveProgressToStorage(state.videoProgress);
    },
    setCurrentVideoIndex: (state, action: PayloadAction<number>) => {
      state.currentVideoIndex = action.payload;
    },
  },
});

export const {
  setCurrentVideo,
  setIsPlaying,
  updateVideoProgress,
  markAsWatched,
  clearVideoProgress,
  clearPlaylistProgress,
  setCurrentVideoIndex,
} = playerSlice.actions;

export default playerSlice.reducer;
