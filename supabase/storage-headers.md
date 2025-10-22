# Storage Cache Headers Configuration

This guide explains how to configure cache headers for optimal video streaming performance.

## Overview

Proper cache headers are critical for:
- Reducing bandwidth costs
- Improving playback performance
- Minimizing CDN load
- Better user experience

## Cache Strategy

### HLS Manifest Files (.m3u8)

**Cache-Control**: `public, max-age=10, s-maxage=10`

- Short cache time (10 seconds)
- Allows playlist updates during live streams
- Keeps segments list fresh

### HLS Segments (.ts)

**Cache-Control**: `public, max-age=31536000, immutable`

- Long cache time (1 year)
- Segments never change once created
- Maximum CDN efficiency

### MP4 Files

**Cache-Control**: `public, max-age=31536000, immutable`

- Long cache time (1 year)
- Static video files
- Permanent caching safe

### Thumbnails & Images

**Cache-Control**: `public, max-age=2592000`

- 30 day cache time
- Balance between freshness and performance
- Allows thumbnail updates

## Supabase Storage Configuration

### Method 1: Supabase Dashboard

Supabase Storage automatically sets appropriate cache headers for public buckets.

For custom headers:
1. Go to Supabase Dashboard
2. Navigate to Storage → Settings
3. Configure bucket-level cache settings

**Note**: As of current Supabase version, custom cache headers per file type may require edge function or CDN configuration.

### Method 2: Using CDN (Recommended for Production)

For production deployments, use a CDN like Cloudflare:

1. **Set up Cloudflare**:
   - Add your Supabase storage URL as a custom domain
   - Configure page rules for cache behavior

2. **Configure Page Rules**:

   ```
   Rule 1: HLS Manifests
   URL Pattern: *storage*/videos/*.m3u8
   Cache Level: Standard
   Edge Cache TTL: 10 seconds
   Browser Cache TTL: 10 seconds
   ```

   ```
   Rule 2: HLS Segments
   URL Pattern: *storage*/videos/*.ts
   Cache Level: Cache Everything
   Edge Cache TTL: 1 year
   Browser Cache TTL: 1 year
   ```

   ```
   Rule 3: MP4 Videos
   URL Pattern: *storage*/videos/*.mp4
   Cache Level: Cache Everything
   Edge Cache TTL: 1 year
   Browser Cache TTL: 1 month
   ```

   ```
   Rule 4: Images
   URL Pattern: *storage*/thumbnails/*
   Cache Level: Cache Everything
   Edge Cache TTL: 30 days
   Browser Cache TTL: 30 days
   ```

## Custom Headers with Edge Function

If you need more control, create a custom edge function:

```typescript
// supabase/functions/storage-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace("/storage-proxy/", "");

  // Fetch from Supabase storage
  const storageUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/${path}`;
  const response = await fetch(storageUrl);

  // Determine cache headers based on file type
  let cacheControl = "public, max-age=31536000, immutable";

  if (path.endsWith(".m3u8")) {
    cacheControl = "public, max-age=10, s-maxage=10";
  } else if (path.endsWith(".ts")) {
    cacheControl = "public, max-age=31536000, immutable";
  } else if (path.endsWith(".mp4") || path.endsWith(".webm")) {
    cacheControl = "public, max-age=31536000, immutable";
  }

  // Create new response with custom headers
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", cacheControl);
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(response.body, {
    status: response.status,
    headers,
  });
});
```

Deploy and use:
```
https://[project-ref].supabase.co/functions/v1/storage-proxy/videos/[path]
```

## Signed URLs for Private Content

For age-restricted or private content:

```typescript
// Create signed URL with expiration
const { data, error } = await supabase.storage
  .from('videos')
  .createSignedUrl('user-id/video.mp4', 3600); // 1 hour

// Use signed URL in player
const videoUrl = data.signedUrl;
```

**Benefits**:
- Time-limited access
- No authentication needed after URL generation
- Still cacheable by CDN
- Automatic expiration

**Cache Headers for Signed URLs**:
```
Cache-Control: private, max-age=3600
```

## Verification

### Test Cache Headers

```bash
# Check HLS manifest
curl -I https://[project-ref].supabase.co/storage/v1/object/public/videos/[path]/playlist.m3u8

# Check HLS segment
curl -I https://[project-ref].supabase.co/storage/v1/object/public/videos/[path]/segment0.ts

# Check MP4 video
curl -I https://[project-ref].supabase.co/storage/v1/object/public/videos/[path]/video.mp4
```

Look for `Cache-Control` header in response.

### Browser DevTools

1. Open video page
2. Open DevTools → Network tab
3. Play video
4. Check video/segment requests
5. Look at Response Headers → Cache-Control

## Best Practices

1. **Use CDN**: Always use CDN in production
2. **Long cache for static assets**: Videos don't change, cache aggressively
3. **Short cache for manifests**: Allow live stream updates
4. **Set immutable flag**: Prevents revalidation requests
5. **Public for public content**: Use `public` directive for CDN caching
6. **Private for protected content**: Use signed URLs with `private` directive

## Performance Metrics

Expected improvements with proper caching:

- **Bandwidth reduction**: 70-90% for repeat views
- **Load time**: 50-80% faster for cached content
- **CDN hit rate**: 85-95% for popular content
- **Origin requests**: Reduced by 80-90%

## Troubleshooting

### Videos not caching

**Check**:
1. Cache-Control header is set
2. CDN is properly configured
3. URLs are consistent (no random query params)
4. No `Cache-Control: no-cache` from origin

### Stale content showing

**Solutions**:
1. Reduce cache time for frequently updated content
2. Use versioned URLs (add ?v=timestamp)
3. Purge CDN cache manually
4. Implement cache invalidation strategy

### CDN costs too high

**Optimize**:
1. Increase cache times
2. Use more aggressive caching for popular content
3. Implement tiered caching strategy
4. Consider origin shield on CDN

## Production Checklist

- [ ] Storage buckets created
- [ ] Cache headers configured
- [ ] CDN set up (if using)
- [ ] Cache verified with curl/browser
- [ ] Signed URLs working for private content
- [ ] Performance metrics tracked
- [ ] Costs monitored
