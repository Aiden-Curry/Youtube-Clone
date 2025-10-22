-- StreamHub Storage Bucket Setup
-- Run this script in Supabase SQL Editor to create storage buckets and policies

-- ============================================================================
-- Create Storage Buckets
-- ============================================================================

-- Videos bucket (public, 5GB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  5368709120, -- 5GB
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/x-mpegURL',
    'video/MP2T',
    'application/vnd.apple.mpegurl'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Thumbnails bucket (public, 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (public, 5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies for Videos Bucket
-- ============================================================================

-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own videos
CREATE POLICY "Users can update own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own videos
CREATE POLICY "Users can delete own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access for all videos
CREATE POLICY "Public read access for videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');

-- ============================================================================
-- Storage Policies for Thumbnails Bucket
-- ============================================================================

-- Allow authenticated users to upload thumbnails to their own folder
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own thumbnails
CREATE POLICY "Users can update own thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own thumbnails
CREATE POLICY "Users can delete own thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access for all thumbnails
CREATE POLICY "Public read access for thumbnails"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- ============================================================================
-- Storage Policies for Avatars Bucket
-- ============================================================================

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access for all avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================================================
-- Verify Setup
-- ============================================================================

-- Check buckets were created
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('videos', 'thumbnails', 'avatars');

-- Check policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%videos%' OR policyname LIKE '%thumbnails%' OR policyname LIKE '%avatars%'
ORDER BY policyname;
