/*
  # Create User Interaction Tables

  ## Overview
  This migration creates tables for user interactions with videos and channels:
  play history, likes, and subscriptions.

  ## New Tables
  
  ### `play_history`
  Track user watch history and progress:
  - `id` (uuid, primary key) - Unique record identifier
  - `user_id` (uuid, FK -> users) - User watching the video
  - `video_id` (uuid, FK -> videos) - Video being watched
  - `seconds_watched` (integer) - Total seconds watched
  - `last_position` (integer) - Last playback position in seconds
  - `updated_at` (timestamptz) - Last update timestamp

  ### `likes`
  User likes on videos:
  - `id` (uuid, primary key) - Unique like identifier
  - `user_id` (uuid, FK -> users) - User who liked
  - `video_id` (uuid, FK -> videos) - Liked video
  - `created_at` (timestamptz) - Like timestamp

  ### `subscriptions`
  Channel subscriptions:
  - `id` (uuid, primary key) - Unique subscription identifier
  - `subscriber_id` (uuid, FK -> users) - Subscribing user
  - `channel_id` (uuid, FK -> channels) - Subscribed channel
  - `created_at` (timestamptz) - Subscription timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only manage their own interactions
  - Users can read their own history, likes, and subscriptions

  ## Indexes
  - Index on play_history.user_id for user history queries
  - Index on play_history.video_id for video analytics
  - Composite unique index on play_history(user_id, video_id)
  - Index on likes.user_id for user likes queries
  - Index on likes.video_id for video likes count
  - Unique constraint on likes(user_id, video_id)
  - Index on subscriptions.subscriber_id for user subscriptions
  - Index on subscriptions.channel_id for channel subscriber count
  - Unique constraint on subscriptions(subscriber_id, channel_id)
*/

-- Create play_history table
CREATE TABLE IF NOT EXISTS play_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  seconds_watched integer DEFAULT 0,
  last_position integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id, channel_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_play_history_user_id ON play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_video_id ON play_history(video_id);
CREATE INDEX IF NOT EXISTS idx_play_history_updated_at ON play_history(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_video_id ON likes(video_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel_id ON subscriptions(channel_id);

-- Enable RLS
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Play history policies
CREATE POLICY "Users can read own play history"
  ON play_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own play history"
  ON play_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own play history"
  ON play_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own play history"
  ON play_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can read own likes"
  ON likes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read like counts"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriber_id);

CREATE POLICY "Anyone can read subscription counts"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = subscriber_id);
