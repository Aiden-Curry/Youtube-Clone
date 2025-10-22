/*
  # Create analytics events tracking

  1. New Tables
    - `analytics_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, foreign key to users)
      - `session_id` (text) - for anonymous tracking
      - `event_type` (text) - view, watch_time, like, subscribe, search, etc.
      - `video_id` (uuid, nullable, foreign key to videos)
      - `channel_id` (uuid, nullable, foreign key to channels)
      - `metadata` (jsonb) - flexible data storage
      - `created_at` (timestamptz)
    
    - `search_queries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, foreign key to users)
      - `query` (text)
      - `results_count` (integer)
      - `created_at` (timestamptz)
    
    - `video_impressions`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key to videos)
      - `user_id` (uuid, nullable, foreign key to users)
      - `context` (text) - home, search, recommended, channel
      - `clicked` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on analytics tables
    - Allow inserts from authenticated and anonymous users
    - Only allow reads for admins and content owners
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Creators can view own channel analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    channel_id IN (
      SELECT id FROM channels
      WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert search queries"
  ON search_queries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view search queries"
  ON search_queries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE TABLE IF NOT EXISTS video_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  context TEXT DEFAULT 'home',
  clicked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert video impressions"
  ON video_impressions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can view own video impressions"
  ON video_impressions
  FOR SELECT
  TO authenticated
  USING (
    video_id IN (
      SELECT v.id FROM videos v
      INNER JOIN channels c ON c.id = v.channel_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all impressions"
  ON video_impressions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_video_id ON analytics_events(video_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_channel_id ON analytics_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_impressions_video_id ON video_impressions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_impressions_created_at ON video_impressions(created_at DESC);
