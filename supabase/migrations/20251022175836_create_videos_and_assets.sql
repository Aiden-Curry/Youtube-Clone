/*
  # Create Videos and Video Assets Tables

  ## Overview
  This migration creates tables for video content and associated media assets
  in a YouTube-like video streaming platform.

  ## New Tables
  
  ### `videos`
  Main video content table:
  - `id` (uuid, primary key) - Unique video identifier
  - `channel_id` (uuid, FK -> channels) - Channel that owns the video
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `status` (enum) - Processing status: processing, public, private, unlisted, blocked
  - `visibility` (enum) - Visibility setting: public, private, unlisted
  - `duration_seconds` (integer) - Video duration in seconds
  - `original_url` (text) - Original uploaded file URL
  - `poster_url` (text) - Thumbnail/poster image URL
  - `hls_master_url` (text) - HLS streaming master playlist URL
  - `views_count` (bigint) - Total views counter
  - `likes_count` (integer) - Total likes counter
  - `tags` (text[]) - Array of tags for categorization
  - `created_at` (timestamptz) - Video creation timestamp
  - `published_at` (timestamptz) - Publication timestamp

  ### `video_assets`
  Multiple media files per video (different qualities, formats):
  - `id` (uuid, primary key) - Unique asset identifier
  - `video_id` (uuid, FK -> videos) - Parent video
  - `type` (enum) - Asset type: source, hls, thumbnail, sprite
  - `url` (text) - Asset file URL
  - `width` (integer) - Video width in pixels
  - `height` (integer) - Video height in pixels
  - `bitrate` (integer) - Bitrate in kbps
  - `codec` (text) - Video codec used
  - `created_at` (timestamptz) - Asset creation timestamp

  ## Security
  - RLS enabled on all tables
  - Public videos readable by all authenticated users
  - Private/unlisted videos only readable by channel owners
  - Only channel owners can insert/update/delete their videos

  ## Indexes
  - Index on videos.channel_id for channel video queries
  - Index on videos.published_at DESC for recent video queries
  - Index on videos.status for filtering
  - GIN index on videos.tags for tag search
  - Full text search index on title and description
  - Index on video_assets.video_id for asset queries
*/

-- Create video status enum
DO $$ BEGIN
  CREATE TYPE video_status AS ENUM ('processing', 'public', 'private', 'unlisted', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create visibility enum
DO $$ BEGIN
  CREATE TYPE video_visibility AS ENUM ('public', 'private', 'unlisted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create asset type enum
DO $$ BEGIN
  CREATE TYPE asset_type AS ENUM ('source', 'hls', 'thumbnail', 'sprite');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status video_status DEFAULT 'processing',
  visibility video_visibility DEFAULT 'private',
  duration_seconds integer DEFAULT 0,
  original_url text,
  poster_url text,
  hls_master_url text,
  views_count bigint DEFAULT 0,
  likes_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Create video_assets table
CREATE TABLE IF NOT EXISTS video_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  url text NOT NULL,
  width integer,
  height integer,
  bitrate integer,
  codec text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_published_at_desc ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_video_assets_video_id ON video_assets(video_id);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_videos_search 
  ON videos USING GIN(to_tsvector('english', title || ' ' || description));

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Public videos readable by all"
  ON videos FOR SELECT
  TO authenticated
  USING (status = 'public' AND visibility = 'public');

CREATE POLICY "Channel owners can read own videos"
  ON videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = videos.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel owners can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = videos.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel owners can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = videos.channel_id
      AND channels.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = videos.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel owners can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = videos.channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- Video assets policies
CREATE POLICY "Assets readable if video is readable"
  ON video_assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = video_assets.video_id
      AND (
        (videos.status = 'public' AND videos.visibility = 'public')
        OR EXISTS (
          SELECT 1 FROM channels
          WHERE channels.id = videos.channel_id
          AND channels.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Video owners can insert assets"
  ON video_assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos v
      JOIN channels c ON c.id = v.channel_id
      WHERE v.id = video_assets.video_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Video owners can update assets"
  ON video_assets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos v
      JOIN channels c ON c.id = v.channel_id
      WHERE v.id = video_assets.video_id
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos v
      JOIN channels c ON c.id = v.channel_id
      WHERE v.id = video_assets.video_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Video owners can delete assets"
  ON video_assets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos v
      JOIN channels c ON c.id = v.channel_id
      WHERE v.id = video_assets.video_id
      AND c.user_id = auth.uid()
    )
  );
