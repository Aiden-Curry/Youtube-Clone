# Quick Start Guide

## Running Locally

1. **Check you have Node.js 20+**:
   ```bash
   node --version
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your Supabase credentials:
   - Get Supabase URL and keys from: https://supabase.com/dashboard → Your Project → Settings → API
   - Get Livepeer API key from: https://livepeer.studio → Developers → API Keys

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## First Time Setup Checklist

- [ ] Node.js 20+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with valid Supabase credentials
- [ ] Supabase project created
- [ ] Database migrations run (see DEPLOYMENT.md)
- [ ] Storage buckets created (run `supabase/setup-storage.sql`)
- [ ] Dev server started (`npm run dev`)

## Common Issues

### "Website not found"
- Make sure dev server is running: `npm run dev`
- Check the server is on port 3000
- Verify no other process is using port 3000

### "Failed to connect to database"
- Check `.env.local` has correct Supabase URL and keys
- Verify Supabase project is active (not paused)
- Check environment variables are loaded (restart dev server)

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `.next` folders, then run `npm install` again

### Build errors
- Use `npm run build` (not `next build` directly)
- Check all environment variables are set

## Minimal .env.local for Testing

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Livepeer (Optional for basic testing)
LIVEPEER_API_KEY=your-livepeer-key-or-skip-this

# App URL (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps

After the site loads:
1. Click "Sign Up" to create an account
2. Complete the channel setup
3. Upload a test video
4. Explore the features

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment.
