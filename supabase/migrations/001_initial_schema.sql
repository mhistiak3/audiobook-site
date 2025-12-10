-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  video_count INTEGER NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  duration TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create video_progress table
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id TEXT NOT NULL,
  playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  current_time FLOAT NOT NULL DEFAULT 0,
  duration FLOAT NOT NULL DEFAULT 0,
  watched BOOLEAN NOT NULL DEFAULT FALSE,
  last_played TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, video_id, playlist_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_date_added ON playlists(date_added DESC);

CREATE INDEX IF NOT EXISTS idx_videos_playlist_id ON videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);

CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_playlist_id ON video_progress(playlist_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_last_played ON video_progress(last_played DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playlists
CREATE POLICY "Users can view their own playlists" 
  ON playlists FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" 
  ON playlists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
  ON playlists FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
  ON playlists FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for videos
CREATE POLICY "Users can view their own videos" 
  ON videos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" 
  ON videos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" 
  ON videos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" 
  ON videos FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for video_progress
CREATE POLICY "Users can view their own video progress" 
  ON video_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video progress" 
  ON video_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress" 
  ON video_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video progress" 
  ON video_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_progress_updated_at BEFORE UPDATE ON video_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
