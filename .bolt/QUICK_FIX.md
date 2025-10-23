# 🔧 TURBOPACK ERROR - FIXED!

## The Problem (SOLVED)
```
Error: `turbo.createProject` is not supported by the wasm bindings
```

## The Solution
✅ **Downgraded to Next.js 15**
- Next.js 15.5.6 uses webpack (no Turbopack issues)
- Build now works on bolt.new

## What You Need to Do

### 1. Verify the Fix
```bash
npm list next
# Should show: next@15.5.6
```

### 2. Deploy to bolt.new
1. Set build command: `npm run build`
2. Add environment variables (see below)
3. Click "Publish"

### 3. Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-app.bolt.new
```

### 4. Supabase Setup
Run these in Supabase SQL Editor:
1. All 9 files from `supabase/migrations/`
2. `supabase/setup-storage.sql`

## That's It!
The Turbopack error is now fixed. Just deploy!

## Need More Help?
- Quick Deploy: `DEPLOY_NOW.md`
- Complete Guide: `BOLT_DEPLOYMENT.md`
- All Docs: `START_HERE.md`
