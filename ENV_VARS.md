# Environment Variables Reference

Complete reference for all environment variables used in StreamHub.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in required variables (marked with ⚠️)

3. Restart dev server after changes

## Required Variables

### ⚠️ NEXT_PUBLIC_SUPABASE_URL

**Required**: Yes
**Type**: Public (exposed to browser)
**Example**: `https://abc123xyz.supabase.co`

Your Supabase project URL.

**How to get**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API → Project URL

---

### ⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY

**Required**: Yes
**Type**: Public (exposed to browser)
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Supabase anonymous/public key. Safe to expose in frontend code.

**How to get**:
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key

**Security**: This key is safe to expose as it respects Row Level Security (RLS) policies.

---

### ⚠️ SUPABASE_SERVICE_ROLE_KEY

**Required**: Yes
**Type**: Secret (server-side only)
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Supabase service role key with admin privileges. Bypasses RLS.

**How to get**:
1. Supabase Dashboard → Settings → API
2. Copy "service_role secret" key

**Security**:
- ⚠️ NEVER expose in frontend code
- ⚠️ NEVER commit to version control
- Only use in server actions and API routes
- Has full database access

---

### ⚠️ LIVEPEER_API_KEY

**Required**: Yes (for live streaming)
**Type**: Secret (server-side only)
**Example**: `abc123-def456-ghi789`

Livepeer API key for live streaming functionality.

**How to get**:
1. Go to https://livepeer.studio
2. Create account or sign in
3. Developers → API Keys
4. Create new API key with streaming permissions
5. Copy and save securely

**Free Tier**: Livepeer offers generous free tier (1000 minutes/month)

---

### ⚠️ NEXT_PUBLIC_APP_URL

**Required**: Yes (production)
**Type**: Public (exposed to browser)
**Example**:
- Development: `http://localhost:3000`
- Production: `https://streamhub.com`

Your application's public URL.

**Usage**:
- Generating share links
- OAuth redirects
- Email templates
- Webhook callbacks

**Important**: No trailing slash

---

## Optional Variables

### NODE_ENV

**Required**: No (auto-set by Next.js)
**Type**: Server-side
**Values**: `development`, `production`, `test`
**Default**: `development`

Runtime environment. Usually set automatically by Next.js.

---

### TEST_USER_EMAIL

**Required**: Only for E2E tests
**Type**: Server-side
**Example**: `test@example.com`

Email address for automated test user.

**Setup**:
1. Create user in Supabase Auth
2. Add email to environment variable
3. Use in E2E tests for authentication

---

### TEST_USER_PASSWORD

**Required**: Only for E2E tests
**Type**: Server-side
**Example**: `testpassword123`

Password for automated test user.

---

### PLAYWRIGHT_BASE_URL

**Required**: No
**Type**: Test environment
**Default**: `http://localhost:3000`
**Example**: `http://localhost:3000`

Base URL for Playwright E2E tests.

---

## Analytics & Monitoring

### NEXT_PUBLIC_GA_ID

**Required**: No
**Type**: Public
**Example**: `G-XXXXXXXXXX`

Google Analytics measurement ID.

**How to get**:
1. Go to https://analytics.google.com
2. Create property
3. Copy measurement ID (starts with G-)

**Usage**: Track page views, events, user behavior

---

### SENTRY_DSN

**Required**: No
**Type**: Public (safe to expose)
**Example**: `https://abc123@o123456.ingest.sentry.io/123456`

Sentry Data Source Name for error tracking.

**How to get**:
1. Go to https://sentry.io
2. Create project
3. Copy DSN from Project Settings

**Features**:
- Real-time error tracking
- Performance monitoring
- Release tracking
- User feedback

---

### SENTRY_ENVIRONMENT

**Required**: No
**Type**: Server-side
**Values**: `development`, `staging`, `production`
**Default**: `production`

Sentry environment name for filtering errors.

---

## Feature Flags

### NEXT_PUBLIC_ENABLE_LIVE_STREAMING

**Required**: No
**Type**: Public
**Values**: `true`, `false`
**Default**: `true`

Enable/disable live streaming features.

---

### NEXT_PUBLIC_ENABLE_COMMENTS

**Required**: No
**Type**: Public
**Values**: `true`, `false`
**Default**: `true`

Enable/disable comment functionality.

---

### NEXT_PUBLIC_ENABLE_ANALYTICS

**Required**: No
**Type**: Public
**Values**: `true`, `false`
**Default**: `true`

Enable/disable analytics tracking.

---

### NEXT_PUBLIC_ENABLE_AGE_VERIFICATION

**Required**: No
**Type**: Public
**Values**: `true`, `false`
**Default**: `true`

Enable/disable age verification gate.

---

## Storage Configuration

### NEXT_PUBLIC_CDN_URL

**Required**: No
**Type**: Public
**Example**: `https://cdn.streamhub.com`

Custom CDN URL for video delivery.

**When to use**:
- Using custom CDN (Cloudflare, Fastly)
- Separate video delivery domain
- Optimizing global delivery

**Default**: Uses Supabase Storage URLs directly

---

### NEXT_PUBLIC_VIDEOS_BUCKET

**Required**: No
**Type**: Public
**Default**: `videos`

Custom name for videos storage bucket.

---

### NEXT_PUBLIC_THUMBNAILS_BUCKET

**Required**: No
**Type**: Public
**Default**: `thumbnails`

Custom name for thumbnails storage bucket.

---

### NEXT_PUBLIC_AVATARS_BUCKET

**Required**: No
**Type**: Public
**Default**: `avatars`

Custom name for avatars storage bucket.

---

## Email Configuration

### SMTP_HOST

**Required**: No
**Type**: Server-side
**Example**: `smtp.sendgrid.net`

SMTP server hostname for custom email.

**When to use**: Custom email provider instead of Supabase Auth emails

---

### SMTP_PORT

**Required**: No
**Type**: Server-side
**Example**: `587`

SMTP server port.

---

### SMTP_USER

**Required**: No
**Type**: Server-side
**Example**: `apikey`

SMTP username/API key.

---

### SMTP_PASSWORD

**Required**: No
**Type**: Secret
**Example**: `SG.abc123...`

SMTP password/API key.

---

### SMTP_FROM_EMAIL

**Required**: No
**Type**: Server-side
**Example**: `noreply@streamhub.com`

Sender email address.

---

### SMTP_FROM_NAME

**Required**: No
**Type**: Server-side
**Example**: `StreamHub`

Sender display name.

---

## Rate Limiting

### RATE_LIMIT_UPLOAD_PER_HOUR

**Required**: No
**Type**: Server-side
**Default**: `10`

Maximum video uploads per user per hour.

---

### RATE_LIMIT_COMMENT_PER_MINUTE

**Required**: No
**Type**: Server-side
**Default**: `5`

Maximum comments per user per minute.

---

### RATE_LIMIT_LIKE_PER_MINUTE

**Required**: No
**Type**: Server-side
**Default**: `10`

Maximum likes per user per minute.

---

## Development Tools

### SKIP_PREFLIGHT_CHECK

**Required**: No
**Type**: Development
**Values**: `true`, `false`

Skip Create React App preflight checks.

---

### NEXT_TELEMETRY_DISABLED

**Required**: No
**Type**: Development
**Values**: `1`, `0`

Disable Next.js telemetry.

---

### DEBUG

**Required**: No
**Type**: Development
**Values**: `true`, `false`

Enable debug logging.

---

## Environment-Specific Files

### Development
- `.env.local` - Local development (gitignored)
- `.env.development` - Development defaults
- Use for local testing and development

### Production
- `.env.production` - Production defaults
- Set secrets in hosting platform
- Never commit real credentials

### Testing
- `.env.test` - Test environment
- `.env.test.local` - Local test overrides

## Security Best Practices

1. **Never commit secrets**
   - Use `.env.local` (gitignored)
   - Add to `.gitignore`

2. **Separate environments**
   - Different keys for dev/staging/production
   - Use separate Supabase projects

3. **Rotate keys regularly**
   - Change API keys periodically
   - Revoke compromised keys immediately

4. **Minimal exposure**
   - Only use `NEXT_PUBLIC_*` when necessary
   - Keep server secrets server-side

5. **Use hosting platform secrets**
   - bolt.new: Set in deployment settings
   - Vercel: Use environment variables UI
   - Never hardcode in application

## Validation

Check your configuration:

```bash
# Install dependencies
npm install

# Test configuration
npm run build

# Should build without errors
```

## Troubleshooting

### Build fails with "Missing environment variable"

**Solution**: Ensure all required variables are set in `.env.local`

### Videos not uploading

**Check**:
1. `NEXT_PUBLIC_SUPABASE_URL` is correct
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Storage buckets exist
4. RLS policies are configured

### Live streaming not working

**Check**:
1. `LIVEPEER_API_KEY` is set
2. Key has streaming permissions
3. Webhooks are configured in Livepeer

### Auth not working

**Check**:
1. Supabase URL and keys are correct
2. Email auth is enabled in Supabase
3. No typos in environment variables

## Support

Need help? Check:
- [Next.js Environment Variables Docs](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [Livepeer Documentation](https://docs.livepeer.org)
