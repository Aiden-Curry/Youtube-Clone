# bolt.new Deployment Guide

## Quick Deploy Instructions

### 1. Build Configuration

The build **MUST** use webpack instead of Turbopack. This is already configured in the project.

**Verify your build script in `package.json`:**
```json
"build": "next build --webpack"
```

### 2. Deployment Settings in bolt.new

When publishing, ensure these settings:

- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 20.x or higher

### 3. Environment Variables

Before deploying, set these environment variables in bolt.new dashboard:

**Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key
NEXT_PUBLIC_APP_URL=https://your-app.bolt.new
```

**Optional (for live streaming):**
```bash
LIVEPEER_API_KEY=your-livepeer-api-key
```

### 4. Supabase Setup (CRITICAL)

Before the app can work, you MUST:

#### A. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Create new project
3. Wait for it to complete setup
4. Get your credentials from Settings → API

#### B. Run Database Migrations
In your Supabase Dashboard → SQL Editor, run these files **in order**:

1. `supabase/migrations/20251022175758_create_users_and_channels.sql`
2. `supabase/migrations/20251022175836_create_videos_and_assets.sql`
3. `supabase/migrations/20251022175904_create_user_interactions.sql`
4. `supabase/migrations/20251022175934_create_comments_and_reports.sql`
5. `supabase/migrations/20251022180001_create_live_streams.sql`
6. `supabase/migrations/20251022180149_seed_dev_data.sql`
7. `supabase/migrations/20251022210102_create_notification_preferences.sql`
8. `supabase/migrations/20251022212027_update_comments_and_add_audit_log.sql`
9. `supabase/migrations/20251022212610_create_analytics_events.sql`

#### C. Set Up Storage Buckets
In Supabase Dashboard → SQL Editor, run:
```sql
supabase/setup-storage.sql
```

This creates:
- `videos` bucket (for uploaded videos)
- `thumbnails` bucket (for video thumbnails)
- `avatars` bucket (for user profile pictures)

### 5. Deploy

After all the above is complete:

1. Click "Publish" in bolt.new
2. Wait for build to complete
3. Visit your deployed URL

## Troubleshooting

### Build Error: "turbo.createProject is not supported"

**Cause**: The build is using Turbopack instead of webpack.

**Solutions**:

1. **Verify build command** is exactly: `npm run build`
   - NOT: `next build`
   - NOT: `npx next build`

2. **Check package.json** has:
   ```json
   "build": "next build --webpack"
   ```

3. **Verify next.config.ts** has both:
   ```typescript
   turbopack: {},
   webpack: (config) => { return config; }
   ```

4. **Clear build cache** and redeploy

### App Loads but Shows Errors

**Check these in order:**

1. **Environment variables are set** in bolt.new dashboard
   - All NEXT_PUBLIC_* vars must be set before build
   - Rebuild after adding env vars

2. **Supabase migrations were run**
   - Go to Supabase → SQL Editor
   - Run all migration files in order
   - Check Table Editor to verify tables exist

3. **Storage buckets exist**
   - Go to Supabase → Storage
   - Should see: videos, thumbnails, avatars
   - If not, run `setup-storage.sql`

4. **RLS policies are enabled**
   - Tables should have RLS enabled
   - Policies should exist for authenticated users
   - Run migrations again if missing

### Database Connection Errors

**"Failed to fetch" or "Network error":**

1. Check NEXT_PUBLIC_SUPABASE_URL is correct
   - Format: `https://xxxxx.supabase.co`
   - No trailing slash

2. Check NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
   - Should start with `eyJ`
   - Copy from Supabase Settings → API

3. Verify Supabase project is active
   - Not paused (free tier pauses after inactivity)
   - Not over quota

### Authentication Doesn't Work

1. **Enable Email Auth** in Supabase:
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Disable "Confirm email" for testing

2. **Check Auth Settings**:
   - Site URL should match NEXT_PUBLIC_APP_URL
   - Add your bolt.new domain to Redirect URLs

3. **Verify User Table**:
   - `public.users` table should exist
   - RLS policies should allow user creation

### Videos Don't Upload

1. **Storage buckets must exist**
   - Run `supabase/setup-storage.sql`

2. **Check bucket policies**:
   - Public read access enabled
   - Authenticated write access enabled

3. **CORS settings**:
   - Allowed origins should include your domain
   - Or use "*" for testing

### Live Streaming Doesn't Work

1. **Livepeer API key required**:
   - Get from https://livepeer.studio
   - Add to LIVEPEER_API_KEY env var
   - Redeploy after adding

2. **Webhook edge function**:
   - Deploy using Supabase CLI or dashboard
   - Located in `supabase/functions/livepeer-webhook/`

## Post-Deployment Checklist

After successful deployment:

- [ ] Site loads without errors
- [ ] Can sign up / sign in
- [ ] Can create channel
- [ ] Can upload video (if storage configured)
- [ ] Can view videos
- [ ] Can post comments
- [ ] Dark mode works
- [ ] Legal pages load (Terms, Privacy, Guidelines)

## Performance Optimization

After deployment works:

1. **Enable Supabase caching**:
   - Go to Settings → API
   - Enable caching for GET requests

2. **Configure CDN headers**:
   - See `supabase/storage-headers.md`
   - Set cache headers for HLS segments

3. **Monitor performance**:
   - Use Supabase Dashboard → Logs
   - Check for slow queries
   - Add indexes as needed

## Support

If issues persist:

1. Check browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup
4. Check [ENV_VARS.md](./ENV_VARS.md) for env var documentation

## Important Notes

- **Builds take 2-3 minutes** on average
- **First deploy** may take longer
- **Environment variables** changes require rebuild
- **Database migrations** are one-time setup
- **Storage buckets** must be created manually in Supabase
- **Free tier** Supabase has quotas (500MB storage, 50,000 monthly active users)

## Next Steps

After successful deployment:

1. Test all major features
2. Set up Livepeer for live streaming
3. Configure domain (if custom)
4. Enable analytics
5. Set up monitoring
6. Plan for scaling

For production use, see [DEPLOYMENT.md](./DEPLOYMENT.md) for additional security and performance configuration.
