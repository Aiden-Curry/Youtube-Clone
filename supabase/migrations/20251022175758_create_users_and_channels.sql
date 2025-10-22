/*
  # Create Users and Channels Tables

  ## Overview
  This migration creates the foundation tables for user accounts and content channels
  in a YouTube-like video streaming platform.

  ## New Tables
  
  ### `users`
  Core user account information:
  - `id` (uuid, primary key) - Unique user identifier
  - `username` (text, unique) - Unique username for login/profile
  - `display_name` (text) - Public display name
  - `avatar_url` (text) - Profile picture URL
  - `bio` (text) - User biography/description
  - `created_at` (timestamptz) - Account creation timestamp

  ### `channels`
  Content creator channels:
  - `id` (uuid, primary key) - Unique channel identifier
  - `user_id` (uuid, FK -> users) - Channel owner
  - `handle` (text, unique) - Unique channel handle (@username style)
  - `name` (text) - Channel display name
  - `description` (text) - Channel description
  - `banner_url` (text) - Channel banner image URL
  - `created_at` (timestamptz) - Channel creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can read their own data
  - Users can update their own profile
  - Channels readable by all authenticated users
  - Channel owners can update their own channels

  ## Indexes
  - Unique index on users.username for fast lookup
  - Unique index on channels.handle for fast lookup
  - Index on channels.user_id for owner queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handle text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  banner_url text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Channels policies
CREATE POLICY "Anyone can read public channels"
  ON channels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Channel owners can insert own channel"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Channel owners can update own channel"
  ON channels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Channel owners can delete own channel"
  ON channels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
