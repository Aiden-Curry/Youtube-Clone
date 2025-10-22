/*
  # Create Live Streams and Chat Tables

  ## Overview
  This migration creates tables for live streaming functionality with real-time chat.

  ## New Tables
  
  ### `live_streams`
  Live stream sessions:
  - `id` (uuid, primary key) - Unique stream identifier
  - `channel_id` (uuid, FK -> channels) - Channel hosting the stream
  - `title` (text) - Stream title
  - `description` (text) - Stream description
  - `status` (enum) - Stream status: scheduled, live, ended
  - `scheduled_for` (timestamptz, nullable) - Scheduled start time
  - `started_at` (timestamptz, nullable) - Actual start time
  - `ended_at` (timestamptz, nullable) - Stream end time
  - `hls_master_url` (text) - HLS streaming URL
  - `chat_enabled` (boolean) - Whether chat is enabled
  - `created_at` (timestamptz) - Stream creation timestamp

  ### `live_chat_messages`
  Real-time chat messages during streams:
  - `id` (uuid, primary key) - Unique message identifier
  - `live_stream_id` (uuid, FK -> live_streams) - Stream the message belongs to
  - `user_id` (uuid, FK -> users) - Message author
  - `body` (text) - Message text content
  - `created_at` (timestamptz) - Message timestamp

  ## Security
  - RLS enabled on all tables
  - Live streams readable by all authenticated users
  - Only channel owners can create/manage streams
  - Chat messages readable by all on active streams
  - Users can post chat messages when authenticated

  ## Indexes
  - Index on live_streams.channel_id for channel streams
  - Index on live_streams.status for active streams queries
  - Index on live_streams.scheduled_for for upcoming streams
  - Index on live_chat_messages.live_stream_id for stream chat
  - Index on live_chat_messages.created_at for chronological ordering
*/

-- Create live stream status enum
DO $$ BEGIN
  CREATE TYPE live_stream_status AS ENUM ('scheduled', 'live', 'ended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create live_streams table
CREATE TABLE IF NOT EXISTS live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status live_stream_status DEFAULT 'scheduled',
  scheduled_for timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  hls_master_url text,
  chat_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create live_chat_messages table
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_stream_id uuid NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_live_streams_channel_id ON live_streams(channel_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled_for ON live_streams(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_stream_id ON live_chat_messages(live_stream_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_created_at ON live_chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;

-- Live streams policies
CREATE POLICY "Anyone can read live streams"
  ON live_streams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Channel owners can insert live streams"
  ON live_streams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = live_streams.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel owners can update own streams"
  ON live_streams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = live_streams.channel_id
      AND channels.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = live_streams.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel owners can delete own streams"
  ON live_streams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = live_streams.channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- Live chat messages policies
CREATE POLICY "Anyone can read chat on active streams"
  ON live_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = live_chat_messages.live_stream_id
      AND live_streams.chat_enabled = true
    )
  );

CREATE POLICY "Users can post chat messages"
  ON live_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = live_chat_messages.live_stream_id
      AND live_streams.status = 'live'
      AND live_streams.chat_enabled = true
    )
  );

CREATE POLICY "Users can delete own chat messages"
  ON live_chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Channel owners can delete chat messages on their streams"
  ON live_chat_messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_streams ls
      JOIN channels c ON c.id = ls.channel_id
      WHERE ls.id = live_chat_messages.live_stream_id
      AND c.user_id = auth.uid()
    )
  );
