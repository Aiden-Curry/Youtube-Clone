/*
  # Create Comments and Reports Tables

  ## Overview
  This migration creates tables for user comments on videos and content moderation reports.

  ## New Tables
  
  ### `comments`
  Video comments with threading support:
  - `id` (uuid, primary key) - Unique comment identifier
  - `video_id` (uuid, FK -> videos) - Video being commented on
  - `user_id` (uuid, FK -> users) - Comment author
  - `parent_id` (uuid, FK -> comments, nullable) - Parent comment for replies
  - `body` (text) - Comment text content
  - `created_at` (timestamptz) - Comment creation timestamp
  - `edited_at` (timestamptz, nullable) - Last edit timestamp

  ### `reports`
  Content moderation reports:
  - `id` (uuid, primary key) - Unique report identifier
  - `reporter_id` (uuid, FK -> users) - User filing the report
  - `target_type` (enum) - Type of content: video, comment, channel
  - `target_id` (uuid) - ID of reported content
  - `reason` (text) - Report reason/category
  - `notes` (text) - Additional report details
  - `created_at` (timestamptz) - Report submission timestamp
  - `status` (enum) - Report status: open, reviewed, actioned

  ## Security
  - RLS enabled on all tables
  - Comments readable by all on public videos
  - Users can create, update, and delete own comments
  - Users can create reports
  - Only moderators/admins can update report status (implemented via service role)

  ## Indexes
  - Index on comments.video_id for video comments queries
  - Index on comments.user_id for user comments queries
  - Index on comments.parent_id for threaded replies
  - Index on comments.created_at for chronological ordering
  - Index on reports.reporter_id for user report history
  - Index on reports.target_type and target_id for content reports
  - Index on reports.status for moderation queue
*/

-- Create report target type enum
DO $$ BEGIN
  CREATE TYPE report_target_type AS ENUM ('video', 'comment', 'channel');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create report status enum
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('open', 'reviewed', 'actioned');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type report_target_type NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  status report_status DEFAULT 'open'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments readable on public videos"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = comments.video_id
      AND videos.status = 'public'
      AND videos.visibility = 'public'
    )
  );

CREATE POLICY "Video owners can read all comments on their videos"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos v
      JOIN channels c ON c.id = v.channel_id
      WHERE v.id = comments.video_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Video owners can delete comments on their videos"
  ON comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos v
      JOIN channels c ON c.id = v.channel_id
      WHERE v.id = comments.video_id
      AND c.user_id = auth.uid()
    )
  );

-- Reports policies
CREATE POLICY "Users can read own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);
