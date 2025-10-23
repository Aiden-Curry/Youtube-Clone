# StreamHub

A modern video streaming platform built with Next.js 16, Supabase, and Livepeer.

## Features

- **Video Upload & Streaming**: Upload videos with automatic HLS transcoding
- **Live Streaming**: RTMP streaming with Livepeer integration
- **User Authentication**: Secure sign up/sign in with Supabase Auth
- **Channel Management**: Create and customize your channel
- **Comments & Interactions**: Engage with likes, comments, and subscriptions
- **Analytics Dashboard**: Track views, watch time, and engagement
- **Content Moderation**: Admin tools, reporting, and audit logs
- **Legal Compliance**: GDPR-compliant with cookie consent, age verification, and legal pages
- **Responsive Design**: Mobile-first design with dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage with CDN
- **Live Streaming**: Livepeer
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Video Player**: HLS.js
- **Testing**: Vitest (unit), Playwright (E2E)
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Livepeer account (for live streaming)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd streamhub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `LIVEPEER_API_KEY`: Your Livepeer API key

5. Set up the database:
   - Go to your Supabase project
   - Run the migrations in `supabase/migrations/` in order
   - Run the storage setup script: `supabase/setup-storage.sql`

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000 in your browser

## Project Structure

```
streamhub/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/             # Utilities and server actions
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
├── e2e/                  # E2E tests (Playwright)
├── tests/                # Unit tests (Vitest)
└── public/              # Static assets
```

## Development

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests with UI
npm run test:ui

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Building

```bash
npm run build
```

**Note**: The build uses webpack instead of Turbopack due to WASM binding issues in Next.js 16. This is configured in `package.json` as `next build --webpack`.

### Linting & Formatting

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions including:
- Supabase project setup
- Storage bucket configuration
- Database migrations
- Edge function deployment
- Environment variable configuration
- bolt.new deployment steps

## Environment Variables

See [ENV_VARS.md](./ENV_VARS.md) for detailed documentation of all environment variables.

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LIVEPEER_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [ENV_VARS.md](./ENV_VARS.md) - Environment variables reference
- [TESTING.md](./TESTING.md) - Testing guide
- [supabase/storage-headers.md](./supabase/storage-headers.md) - Storage and caching configuration

## Features in Detail

### Video Upload
- Drag & drop upload interface
- Resumable uploads with tus-js-client
- Automatic HLS transcoding
- Thumbnail generation
- Metadata management (title, description, tags)
- Visibility controls (public, unlisted, private)
- Age restriction support

### Live Streaming
- RTMP stream creation
- Stream key management
- Live chat
- Viewer count
- Stream analytics

### User Management
- Email/password authentication
- User profiles with avatars
- Channel creation and customization
- Subscriber management

### Content Discovery
- Video search
- Tag-based filtering
- Recommended videos
- Channel browsing
- Trending content

### Analytics
- Video view tracking
- Watch time analytics
- Engagement metrics
- Channel analytics
- Admin dashboard

### Content Moderation
- User reporting system
- Comment moderation
- Video flagging
- Admin review dashboard
- Audit logging

### Legal & Compliance
- Terms of Service
- Privacy Policy
- Community Guidelines
- Cookie consent banner
- GDPR compliance
- Age verification gate

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Run linter and tests
5. Submit a pull request

## Security

- Row Level Security (RLS) enabled on all tables
- Service role key kept server-side only
- Storage buckets with proper policies
- Input validation and sanitization
- Content security policies
- Rate limiting (planned)

## Performance

- HLS adaptive streaming
- CDN-friendly cache headers
- Image optimization
- Code splitting
- Server-side rendering
- Static page generation where possible

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Known Issues

- Next.js 16 Turbopack WASM binding issues (using webpack for builds)
- Middleware deprecation warning (will migrate to proxy in future)

## Roadmap

- [ ] Mobile apps (iOS, Android)
- [ ] Advanced analytics
- [ ] Monetization features
- [ ] Multi-language support
- [ ] Advanced video editing
- [ ] Collaborative features
- [ ] API for third-party integrations

## License

[Your License Here]

## Support

For issues and questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
- Contact support team

## Acknowledgments

- Next.js team
- Supabase team
- Livepeer team
- Open source community
