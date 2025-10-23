# 🚀 Deploy to bolt.new - Quick Guide

## ⚠️ CRITICAL: Build Configuration

The build **MUST** use this exact command:
```bash
npm run build
```

**DO NOT USE:**
- ❌ `next build`
- ❌ `npx next build`

**Why?** Next.js 16 Turbopack has WASM binding issues. The project is configured to use webpack via the `--webpack` flag.

---

## Step 1: Supabase Setup (Do This First!)

### A. Create Supabase Project
1. Visit https://supabase.com/dashboard
2. Click "New Project"
3. Wait for setup to complete (2-3 minutes)

### B. Get Your Credentials
Go to: **Settings → API**

Copy these values:
- **Project URL**: `https://xxxxx.supabase.co`
- **Anon key**: `eyJhbGc...`
- **Service role key**: `eyJhbGc...`

### C. Run Database Migrations
Go to: **SQL Editor** in Supabase Dashboard

Run these files **IN ORDER** (copy/paste contents):
1. `supabase/migrations/20251022175758_create_users_and_channels.sql`
2. `supabase/migrations/20251022175836_create_videos_and_assets.sql`
3. `supabase/migrations/20251022175904_create_user_interactions.sql`
4. `supabase/migrations/20251022175934_create_comments_and_reports.sql`
5. `supabase/migrations/20251022180001_create_live_streams.sql`
6. `supabase/migrations/20251022180149_seed_dev_data.sql`
7. `supabase/migrations/20251022210102_create_notification_preferences.sql`
8. `supabase/migrations/20251022212027_update_comments_and_add_audit_log.sql`
9. `supabase/migrations/20251022212610_create_analytics_events.sql`

### D. Create Storage Buckets
In **SQL Editor**, run the entire file:
- `supabase/setup-storage.sql`

---

## Step 2: Configure bolt.new

### Set Environment Variables

In bolt.new dashboard, add these:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-app.bolt.new

# Livepeer (Optional - for live streaming)
LIVEPEER_API_KEY=your-livepeer-key
```

### Set Build Command

**Build Command:** `npm run build`

**Node Version:** 20.x or higher

---

## Step 3: Deploy

Click **"Publish"** in bolt.new

Wait 2-3 minutes for build to complete.

---

## Step 4: Verify Deployment

After deployment:

1. ✅ Site loads without errors
2. ✅ Can sign up / sign in
3. ✅ Can create channel
4. ✅ Home page shows correctly
5. ✅ Legal pages load (Terms, Privacy, Guidelines)

---

## 🔥 Troubleshooting

### Build Error: "turbo.createProject is not supported"

**Solution:**
- Verify build command is: `npm run build`
- Check `package.json` has: `"build": "next build --webpack"`
- Clear cache and redeploy

### "Website not found" or "Failed to fetch"

**Solution:**
1. Verify all environment variables are set in bolt.new
2. Rebuild after adding env vars
3. Check Supabase project is active (not paused)

### Database Errors: "relation does not exist"

**Solution:**
- Run all migration files in Supabase SQL Editor
- Check tables exist in Supabase → Table Editor

### Videos Won't Upload

**Solution:**
- Run `supabase/setup-storage.sql`
- Check Storage → Buckets shows: videos, thumbnails, avatars

---

## 📚 More Help

- **Complete Guide**: [BOLT_DEPLOYMENT.md](./BOLT_DEPLOYMENT.md)
- **Environment Variables**: [ENV_VARS.md](./ENV_VARS.md)
- **General Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Local Development**: [QUICKSTART.md](./QUICKSTART.md)

---

## ✨ Quick Reference

### Build Command (bolt.new settings)
```bash
npm run build
```

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-app.bolt.new
```

### Supabase Setup
1. Create project
2. Run 9 migration files
3. Run storage setup SQL
4. Copy credentials to bolt.new

**You're ready to deploy! 🎉**
