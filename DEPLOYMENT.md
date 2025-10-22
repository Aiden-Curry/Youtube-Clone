# StreamHub Deployment Guide

Complete guide for deploying StreamHub to production on bolt.new hosting with Supabase database and storage.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Storage Configuration](#storage-configuration)
4. [Database Migrations](#database-migrations)
5. [Edge Functions](#edge-functions)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Supabase account (https://supabase.com)
- Livepeer account for live streaming (https://livepeer.studio)
- Node.js 20+ installed locally
- Git repository set up

## Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: `streamhub-production`
   - Database Password: Generate strong password (save securely)
   - Region: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### 2. Get Project Credentials

Navigate to Project Settings → API:

- **Project URL**: `https://[project-ref].supabase.co`
- **Anon (public) key**: Starts with `eyJ...`
- **Service Role key**: Starts with `eyJ...` (keep secret!)

Save these for environment variables.

## Storage Configuration

### 1. Create Storage Buckets

Go to Storage section in Supabase Dashboard:

#### Create `videos` bucket:
```sql
-- Public bucket for video files
CREATE BUCKET videos WITH (
  public = true,
  file_size_limit = 5368709120, -- 5GB
  allowed_mime_types = array[
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/x-mpegURL',
    'video/MP2T'
  ]
);
```

#### Create `thumbnails` bucket:
```sql
-- Public bucket for video thumbnails
CREATE BUCKET thumbnails WITH (
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
);
```

#### Create `avatars` bucket:
```sql
-- Public bucket for user avatars
CREATE BUCKET avatars WITH (
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
);
```

### 2. Configure Storage Policies

Run these SQL commands in Supabase SQL Editor:

```sql
-- Videos Bucket Policies
-- Allow authenticated users to upload
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

-- Thumbnails Bucket Policies
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public read access for thumbnails"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Avatars Bucket Policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### 3. Configure Cache Headers

In Supabase Dashboard → Storage → Configuration:

Set custom cache headers for video streaming:

```
Cache-Control: public, max-age=31536000, immutable
```

For HLS manifests (.m3u8):
```
Cache-Control: public, max-age=10
```

For HLS segments (.ts):
```
Cache-Control: public, max-age=31536000, immutable
```

**Note**: Supabase Storage automatically handles cache headers. For custom CDN setup, configure at the CDN level.

### 4. Storage URL Format

Public URLs for assets:
```
https://[project-ref].supabase.co/storage/v1/object/public/videos/[path]
https://[project-ref].supabase.co/storage/v1/object/public/thumbnails/[path]
https://[project-ref].supabase.co/storage/v1/object/public/avatars/[path]
```

For authenticated/signed URLs:
```typescript
const { data } = await supabase.storage
  .from('videos')
  .createSignedUrl('path/to/file.mp4', 3600); // 1 hour expiry
```

## Database Migrations

### 1. Run All Migrations

The project includes migrations in `supabase/migrations/`. Run them in order:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Run all migrations
supabase db push
```

Alternatively, run migrations manually in Supabase SQL Editor:

1. Go to SQL Editor in Supabase Dashboard
2. Open each migration file in `supabase/migrations/`
3. Copy and execute SQL in order by filename

**Migration Files:**
- `20251022175758_create_users_and_channels.sql`
- `20251022175836_create_videos_and_assets.sql`
- `20251022175904_create_user_interactions.sql`
- `20251022175934_create_comments_and_reports.sql`
- `20251022180001_create_live_streams.sql`
- `20251022180149_seed_dev_data.sql` (skip in production)
- `20251022210102_create_notification_preferences.sql`
- `20251022212027_update_comments_and_add_audit_log.sql`
- `20251022212610_create_analytics_events.sql`

### 2. Verify Migrations

Check that all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- analytics_events
- audit_log
- channels
- comments
- live_chat_messages
- live_streams
- likes
- notification_preferences
- reports
- search_queries
- subscriptions
- users
- video_assets
- videos
- watch_history

### 3. Create Initial Admin User

```sql
-- After first user signs up, make them admin
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin@example.com';
```

## Edge Functions

### 1. Deploy Edge Functions

StreamHub includes two edge functions:

#### Livepeer Webhook Handler

Deploy using Supabase CLI:

```bash
supabase functions deploy livepeer-webhook
```

Or use the MCP tools if available in your environment.

**Webhook URL**:
```
https://[project-ref].supabase.co/functions/v1/livepeer-webhook
```

Configure this URL in Livepeer Dashboard → Webhooks.

#### Notification Handler

Deploy the notification function:

```bash
supabase functions deploy send-notifications
```

### 2. Configure Livepeer Webhooks

1. Go to Livepeer Dashboard (https://livepeer.studio)
2. Navigate to Webhooks
3. Add webhook endpoint:
   - URL: `https://[project-ref].supabase.co/functions/v1/livepeer-webhook`
   - Events: Select all stream events
   - Save webhook

### 3. Test Edge Functions

Test the webhook:

```bash
curl -X POST \
  https://[project-ref].supabase.co/functions/v1/livepeer-webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "stream": {"id": "test-123"}}'
```

## Environment Variables

### Required Environment Variables

Create `.env.local` file in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Livepeer Configuration
LIVEPEER_API_KEY=your-livepeer-api-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Error Tracking
SENTRY_DSN=https://...
```

### Get Livepeer API Key

1. Go to https://livepeer.studio
2. Create account or sign in
3. Navigate to Developers → API Keys
4. Create new API key
5. Copy and save securely

### Environment Variables for bolt.new

When deploying to bolt.new, set these environment variables in the deployment settings:

1. Go to your bolt.new project
2. Navigate to Settings → Environment Variables
3. Add each variable from `.env.local`
4. Make sure to mark `SUPABASE_SERVICE_ROLE_KEY` and `LIVEPEER_API_KEY` as secret

## Deployment

### 1. Prepare for Deployment

```bash
# Install dependencies
npm install

# Run tests
npm run test -- --run
npm run test:e2e

# Build application
npm run build

# Check for errors
npm run lint
```

### 2. Deploy to bolt.new

#### Option A: Deploy from GitHub

1. Push your code to GitHub
2. Connect GitHub repository to bolt.new
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Add environment variables
5. Deploy

#### Option B: Deploy with CLI

```bash
# Deploy current directory
bolt deploy

# Or specify project
bolt deploy --project streamhub
```

### 3. Configure Custom Domain (Optional)

1. In bolt.new dashboard, go to Domains
2. Add custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning
5. Update `NEXT_PUBLIC_APP_URL` environment variable

### 4. Configure CORS for Supabase

If using custom domain, add it to Supabase CORS:

1. Go to Supabase Dashboard → Settings → API
2. Add your domain to "CORS allowed origins"
3. Save changes

## Post-Deployment

### 1. Verify Deployment

Check these URLs:
- `https://your-domain.com` - Homepage loads
- `https://your-domain.com/legal/terms` - Legal pages work
- `https://your-domain.com/auth/signin` - Auth pages work

### 2. Test Core Features

1. **Sign Up**: Create test account
2. **Upload Video**: Upload small test video
3. **Watch Video**: Play uploaded video
4. **Live Stream**: Create live stream, verify RTMP credentials
5. **Comments**: Post comment on video
6. **Analytics**: Check studio analytics

### 3. Monitor Logs

Check logs for errors:
- bolt.new Dashboard → Logs
- Supabase Dashboard → Logs
- Livepeer Dashboard → Streams

### 4. Set Up Monitoring

Consider adding:
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible

### 5. Backup Strategy

Enable Supabase backups:
1. Go to Supabase Dashboard → Database → Backups
2. Enable automatic backups
3. Set retention period
4. Test restore process

## Troubleshooting

### Videos Not Playing

**Issue**: Videos upload but don't play

**Solutions**:
1. Check storage bucket is public
2. Verify CORS settings in Supabase
3. Check video format (MP4 H.264 recommended)
4. Verify HLS transcoding completed
5. Check browser console for errors

### Live Streams Not Starting

**Issue**: Can't start live stream

**Solutions**:
1. Verify Livepeer API key is set
2. Check webhook is configured correctly
3. Test RTMP connection with OBS
4. Check Livepeer dashboard for stream status
5. Verify edge function deployed

### Authentication Issues

**Issue**: Can't sign in or sign up

**Solutions**:
1. Check Supabase project is active
2. Verify environment variables are set
3. Check CORS settings
4. Enable email auth in Supabase
5. Check user table policies

### Database Connection Errors

**Issue**: Can't connect to database

**Solutions**:
1. Verify Supabase URL is correct
2. Check anon key is valid
3. Verify project is not paused
4. Check database is not at connection limit
5. Review RLS policies

### Upload Failures

**Issue**: Video uploads fail

**Solutions**:
1. Check storage bucket exists
2. Verify storage policies allow uploads
3. Check file size limits (5GB default)
4. Verify MIME type is allowed
5. Check user is authenticated

### Performance Issues

**Issue**: Slow page loads or video playback

**Solutions**:
1. Enable CDN caching for static assets
2. Optimize images (use WebP)
3. Enable Supabase connection pooling
4. Use HLS streaming for large videos
5. Check database query performance

## Security Checklist

Before going live:

- [ ] All RLS policies are enabled and tested
- [ ] Service role key is kept secret
- [ ] CORS is configured correctly
- [ ] Storage buckets have proper policies
- [ ] Rate limiting is enabled (if applicable)
- [ ] Admin users are designated
- [ ] Test user accounts are removed
- [ ] Environment variables are set in production
- [ ] HTTPS is enabled (automatic on bolt.new)
- [ ] Edge functions are deployed
- [ ] Webhooks are secured

## Maintenance

### Regular Tasks

**Daily**:
- Monitor error logs
- Check uptime status

**Weekly**:
- Review storage usage
- Check database performance
- Review user reports

**Monthly**:
- Update dependencies
- Review security patches
- Backup verification
- Cost analysis

### Scaling Considerations

As your platform grows:

1. **Database**: Upgrade Supabase plan for more connections
2. **Storage**: Monitor usage, consider CDN for video delivery
3. **Functions**: Monitor edge function execution time
4. **Livepeer**: Upgrade plan for more streaming minutes

## Support

- **Supabase Support**: https://supabase.com/support
- **Livepeer Support**: https://docs.livepeer.org
- **bolt.new Support**: Check bolt.new documentation

## Next Steps

1. Set up staging environment
2. Configure CI/CD pipeline
3. Add monitoring and alerts
4. Plan content moderation workflow
5. Set up customer support system
