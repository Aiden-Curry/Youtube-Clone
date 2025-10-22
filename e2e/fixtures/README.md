# Test Fixtures

This directory contains test files used in E2E tests.

## Required Files

- `test-video.mp4` - A small test video file for upload testing

You can create a test video file using FFmpeg:

```bash
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=frequency=1000:duration=10 -pix_fmt yuv420p test-video.mp4
```

Or use any small MP4 file (recommended size: < 10MB).
