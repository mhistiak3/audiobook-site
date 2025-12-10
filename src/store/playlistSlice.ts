import { hybridStorage } from "@/lib/hybridStorage";
import { Playlist } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlaylistState {
  playlists: Playlist[];
  currentPlaylistId: string | null;
}

const initialState: PlaylistState = {
  playlists: [],
  currentPlaylistId: null,
};

const playlistSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    setPlaylists: (state, action: PayloadAction<Playlist[]>) => {
      state.playlists = action.payload;
    },
    addPlaylist: (state, action: PayloadAction<Playlist>) => {
      const existingIndex = state.playlists.findIndex(
        (p) => p.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.playlists[existingIndex] = action.payload;
      } else {
        state.playlists.unshift(action.payload);
      }
      hybridStorage.savePlaylist(action.payload);
    },
    deletePlaylist: (state, action: PayloadAction<string>) => {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload);
      hybridStorage.deletePlaylist(action.payload);
    },
    removeVideoFromPlaylist: (
      state,
      action: PayloadAction<{ playlistId: string; videoId: string }>
    ) => {
      const playlist = state.playlists.find(
        (p) => p.id === action.payload.playlistId
      );
      if (playlist) {
        playlist.videos = playlist.videos.filter(
          (v) => v.id !== action.payload.videoId
        );
        playlist.videoCount = playlist.videos.length;
        hybridStorage.removeVideo(
          action.payload.playlistId,
          action.payload.videoId
        );
      }
    },
    setCurrentPlaylist: (state, action: PayloadAction<string | null>) => {
      state.currentPlaylistId = action.payload;
    },
  },
});

export const {
  setPlaylists,
  addPlaylist,
  deletePlaylist,
  removeVideoFromPlaylist,
  setCurrentPlaylist,
} = playlistSlice.actions;

export default playlistSlice.reducer;
