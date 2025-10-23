# bolt.new Configuration

This directory contains configuration for deploying to bolt.new.

## config.json

Specifies the build, install, and start commands for deployment.

**Contents:**
```json
{
  "build": {
    "command": "npm run build"
  },
  "install": {
    "command": "npm install"
  },
  "start": {
    "command": "npm start"
  }
}
```

## Critical Build Requirements

### The build MUST use webpack, not Turbopack

**Why?** Next.js 16 uses Turbopack by default, which has WASM binding issues in bolt.new environment.

**Solution:** The `package.json` build script includes the `--webpack` flag:
```json
"build": "next build --webpack"
```

### Build Command

**ALWAYS use:** `npm run build`

**NEVER use:**
- `next build` (will fail with Turbopack error)
- `npx next build` (may fail)
- Direct Next.js commands

## Deployment Checklist

Before clicking "Publish" in bolt.new:

### 1. Environment Variables Must Be Set

Go to bolt.new dashboard and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_APP_URL=https://your-app.bolt.new
```

### 2. Supabase Database Must Be Setup

In Supabase SQL Editor, run all migration files from `supabase/migrations/` in order.

### 3. Supabase Storage Must Be Setup

In Supabase SQL Editor, run `supabase/setup-storage.sql` to create buckets.

### 4. Build Settings

In bolt.new deployment settings:
- Build Command: `npm run build`
- Node Version: 20.x
- Install Command: `npm install` (default)
- Start Command: `npm start` (default)

## Common Deployment Errors

### Error: "turbo.createProject is not supported by the wasm bindings"

**Cause:** Build is using Turbopack instead of webpack

**Fix:**
- Ensure build command is `npm run build` (not `next build`)
- Check `package.json` has `"build": "next build --webpack"`
- Clear build cache and redeploy

### Error: "Website not found"

**Cause:** Build succeeded but app isn't starting

**Fix:**
- Check environment variables are set
- Verify start command is `npm start`
- Check deployment logs for errors

### Error: "Failed to fetch"

**Cause:** Environment variables not set or incorrect

**Fix:**
- Add all required env vars in bolt.new dashboard
- Rebuild after adding env vars (env vars at build time affect client-side code)
- Verify Supabase URL and keys are correct

### Error: "relation does not exist"

**Cause:** Database migrations not run

**Fix:**
- Go to Supabase SQL Editor
- Run all migration files from `supabase/migrations/`
- Verify tables exist in Table Editor

## Files in This Directory

- `config.json` - bolt.new deployment configuration
- `README.md` - This file

## Additional Resources

- [BOLT_DEPLOYMENT.md](../BOLT_DEPLOYMENT.md) - Complete bolt.new deployment guide
- [DEPLOYMENT.md](../DEPLOYMENT.md) - General deployment guide
- [ENV_VARS.md](../ENV_VARS.md) - Environment variables reference
- [QUICKSTART.md](../QUICKSTART.md) - Local development guide

## Support

If deployment fails:
1. Check bolt.new build logs
2. Verify environment variables are set
3. Confirm Supabase setup is complete
4. Review [BOLT_DEPLOYMENT.md](../BOLT_DEPLOYMENT.md)
