# Testing Guide

This project includes comprehensive unit tests and end-to-end tests to ensure quality and reliability.

## Test Setup

Install dependencies:
```bash
npm install
```

Copy the environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase and Livepeer credentials in `.env`.

## Unit Tests

Unit tests are written with Vitest and test server actions and utility functions.

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test tests/lib/auth/actions.test.ts
```

### Unit Test Structure

```
tests/
├── setup.ts                          # Test setup and mocks
├── lib/
│   ├── auth/
│   │   └── actions.test.ts           # Auth action tests
│   ├── analytics/
│   │   └── actions.test.ts           # Analytics tests
│   ├── live/
│   │   └── actions.test.ts           # Live streaming tests
│   └── profanity-filter.test.ts      # Profanity filter tests
```

### Writing Unit Tests

Example test:
```typescript
import { describe, it, expect, vi } from "vitest";
import { myFunction } from "@/lib/my-module";

describe("My Module", () => {
  it("should do something", () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

## End-to-End Tests

E2E tests are written with Playwright and test complete user flows.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e e2e/upload-flow.spec.ts
```

### E2E Test Structure

```
e2e/
├── auth.setup.ts              # Authentication setup
├── upload-flow.spec.ts        # Upload and playback tests
├── legal-pages.spec.ts        # Legal pages tests
└── fixtures/
    ├── README.md
    └── test-video.mp4         # Test video file
```

### Creating Test Fixtures

Create a test video file:
```bash
cd e2e/fixtures
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 \
       -f lavfi -i sine=frequency=1000:duration=10 \
       -pix_fmt yuv420p test-video.mp4
```

### E2E Test Coverage

The E2E tests cover:

1. **Upload Flow**
   - Navigate to upload page
   - Select video file
   - Fill in metadata (title, description, tags)
   - Set visibility and age restriction
   - Submit upload
   - Verify processing starts

2. **Playback Flow**
   - Navigate to video watch page
   - Load video player
   - Play video
   - Track view count
   - Verify analytics tracking

3. **Live Streaming**
   - Create live stream
   - Get RTMP credentials
   - Display stream key
   - Start/stop stream

4. **Legal Pages**
   - Terms of Service
   - Privacy Policy
   - Community Guidelines
   - Cookie consent banner

5. **Analytics**
   - Studio analytics dashboard
   - Admin analytics (if admin user)
   - View tracking
   - Watch time tracking

## CI/CD

Tests run automatically on pull requests via GitHub Actions.

### GitHub Actions Workflow

The CI workflow includes:
1. **Lint** - ESLint and Prettier checks
2. **Unit Tests** - Vitest tests
3. **Build** - Next.js build
4. **E2E Tests** - Playwright tests

### Required Secrets

Configure these secrets in your GitHub repository:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LIVEPEER_API_KEY`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

### Viewing Test Results

- Unit test results appear in the GitHub Actions logs
- E2E test results and screenshots are uploaded as artifacts
- Playwright HTML report is available for download

## Test Database

For E2E tests, use a separate test database:

1. Create a new Supabase project for testing
2. Run all migrations
3. Create a test user account
4. Add credentials to `.env` or GitHub Secrets

## Troubleshooting

### Tests Failing Locally

1. Ensure `.env` is properly configured
2. Check that dev server is running for E2E tests
3. Install Playwright browsers: `npx playwright install`
4. Create test fixtures in `e2e/fixtures/`

### E2E Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify Supabase and Livepeer API availability

### Mock Data Issues

- Clear test database between runs
- Ensure test user exists
- Check RLS policies allow test operations

## Best Practices

1. **Isolation** - Each test should be independent
2. **Cleanup** - Clean up test data after tests
3. **Reliability** - Use waitFor for async operations
4. **Coverage** - Test both happy paths and edge cases
5. **Documentation** - Document complex test scenarios

## Contributing

When adding new features:
1. Write unit tests for server actions
2. Add E2E tests for user-facing features
3. Ensure all tests pass before submitting PR
4. Update this guide if adding new test patterns
