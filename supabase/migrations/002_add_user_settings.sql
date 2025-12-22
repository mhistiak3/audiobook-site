-- Create user_settings table to store user preferences like API keys
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  youtube_api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" 
  ON user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON user_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON user_settings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
  ON user_settings FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

