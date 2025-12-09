import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./playerSlice";
import playlistReducer from "./playlistSlice";

export const store = configureStore({
  reducer: {
    playlists: playlistReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
