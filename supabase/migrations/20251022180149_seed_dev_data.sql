/*
  # Seed Development Data

  ## Overview
  This migration seeds the database with minimal development data for testing:
  - 3 test users
  - 3 channels (one per user)
  - 10 videos across channels
  - Sample video assets
  - Sample comments
  - Sample likes and subscriptions
  - Sample play history

  ## Important Notes
  - This is development data only
  - All timestamps use realistic relative dates
  - Video URLs use placeholder/demo URLs
  - Data follows realistic YouTube-like patterns
*/

-- Insert test users
INSERT INTO users (id, username, display_name, avatar_url, bio, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'techguru', 'Tech Guru', 'https://api.dicebear.com/7.x/avataaars/svg?seed=techguru', 'Full-stack developer sharing web development tutorials', now() - interval '180 days'),
  ('22222222-2222-2222-2222-222222222222', 'designpro', 'Design Pro', 'https://api.dicebear.com/7.x/avataaars/svg?seed=designpro', 'UI/UX designer creating beautiful interfaces', now() - interval '150 days'),
  ('33333333-3333-3333-3333-333333333333', 'devops_master', 'DevOps Master', 'https://api.dicebear.com/7.x/avataaars/svg?seed=devops', 'Cloud infrastructure and automation expert', now() - interval '120 days')
ON CONFLICT (id) DO NOTHING;

-- Insert channels
INSERT INTO channels (id, user_id, handle, name, description, banner_url, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '@techguru', 'Tech Guru', 'Learn web development from scratch to advanced', 'https://picsum.photos/seed/techguru/1920/480', now() - interval '180 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '@designpro', 'Design Pro Studio', 'Master UI/UX design and modern design principles', 'https://picsum.photos/seed/designpro/1920/480', now() - interval '150 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '@devops_master', 'DevOps Academy', 'DevOps tutorials and cloud infrastructure guides', 'https://picsum.photos/seed/devops/1920/480', now() - interval '120 days')
ON CONFLICT (id) DO NOTHING;

-- Insert videos
INSERT INTO videos (id, channel_id, title, description, status, visibility, duration_seconds, poster_url, hls_master_url, views_count, likes_count, tags, created_at, published_at) VALUES
  ('10000001-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Next.js 14 Complete Tutorial', 'Learn everything about Next.js 14 including App Router, Server Components, and more', 'public', 'public', 3600, 'https://picsum.photos/seed/nextjs/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 125000, 4500, ARRAY['nextjs', 'react', 'tutorial', 'web-development'], now() - interval '7 days', now() - interval '7 days'),
  ('20000002-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TypeScript Best Practices 2024', 'Modern TypeScript patterns and practices for building scalable applications', 'public', 'public', 2700, 'https://picsum.photos/seed/typescript/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 89000, 3200, ARRAY['typescript', 'javascript', 'programming'], now() - interval '14 days', now() - interval '14 days'),
  ('30000003-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'React Server Components Deep Dive', 'Understanding React Server Components and how they work in Next.js', 'public', 'public', 4200, 'https://picsum.photos/seed/rsc/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 156000, 5800, ARRAY['react', 'nextjs', 'server-components'], now() - interval '3 days', now() - interval '3 days'),
  ('40000004-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Figma to React: Complete Workflow', 'Learn how to convert Figma designs into production-ready React components', 'public', 'public', 5400, 'https://picsum.photos/seed/figma/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 203000, 7200, ARRAY['figma', 'design', 'react', 'ui-ux'], now() - interval '10 days', now() - interval '10 days'),
  ('50000005-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Modern CSS Techniques', 'Master CSS Grid, Flexbox, and modern layout patterns', 'public', 'public', 3300, 'https://picsum.photos/seed/css/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 78000, 2900, ARRAY['css', 'web-design', 'frontend'], now() - interval '21 days', now() - interval '21 days'),
  ('60000006-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tailwind CSS Masterclass', 'Build beautiful UIs faster with Tailwind CSS utility classes', 'public', 'public', 4800, 'https://picsum.photos/seed/tailwind/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 134000, 5100, ARRAY['tailwind', 'css', 'design'], now() - interval '5 days', now() - interval '5 days'),
  ('70000007-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Docker for Developers', 'Complete guide to Docker containerization for modern applications', 'public', 'public', 6000, 'https://picsum.photos/seed/docker/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 189000, 6700, ARRAY['docker', 'devops', 'containers'], now() - interval '12 days', now() - interval '12 days'),
  ('80000008-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Kubernetes Essentials', 'Learn Kubernetes fundamentals and deploy your first cluster', 'public', 'public', 7200, 'https://picsum.photos/seed/k8s/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 92000, 3400, ARRAY['kubernetes', 'devops', 'cloud'], now() - interval '18 days', now() - interval '18 days'),
  ('90000009-9999-9999-9999-999999999999', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'CI/CD with GitHub Actions', 'Automate your deployment pipeline with GitHub Actions', 'public', 'public', 3900, 'https://picsum.photos/seed/cicd/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 112000, 4200, ARRAY['cicd', 'github', 'automation'], now() - interval '6 days', now() - interval '6 days'),
  ('a000000a-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Building REST APIs with Node.js', 'Create production-ready REST APIs using Node.js and Express', 'public', 'public', 5100, 'https://picsum.photos/seed/nodejs/1280/720', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 167000, 5900, ARRAY['nodejs', 'api', 'backend'], now() - interval '9 days', now() - interval '9 days')
ON CONFLICT (id) DO NOTHING;

-- Insert video assets
INSERT INTO video_assets (video_id, type, url, width, height, bitrate, codec) VALUES
  ('10000001-1111-1111-1111-111111111111', 'thumbnail', 'https://picsum.photos/seed/nextjs/1280/720', 1280, 720, NULL, NULL),
  ('10000001-1111-1111-1111-111111111111', 'hls', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 1920, 1080, 5000, 'h264'),
  ('20000002-2222-2222-2222-222222222222', 'thumbnail', 'https://picsum.photos/seed/typescript/1280/720', 1280, 720, NULL, NULL),
  ('30000003-3333-3333-3333-333333333333', 'thumbnail', 'https://picsum.photos/seed/rsc/1280/720', 1280, 720, NULL, NULL),
  ('40000004-4444-4444-4444-444444444444', 'thumbnail', 'https://picsum.photos/seed/figma/1280/720', 1280, 720, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Insert subscriptions
INSERT INTO subscriptions (subscriber_id, channel_id, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() - interval '60 days'),
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '45 days'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '90 days'),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() - interval '30 days'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() - interval '75 days'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() - interval '50 days')
ON CONFLICT DO NOTHING;

-- Insert likes
INSERT INTO likes (user_id, video_id, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '40000004-4444-4444-4444-444444444444', now() - interval '9 days'),
  ('11111111-1111-1111-1111-111111111111', '70000007-7777-7777-7777-777777777777', now() - interval '11 days'),
  ('22222222-2222-2222-2222-222222222222', '10000001-1111-1111-1111-111111111111', now() - interval '6 days'),
  ('22222222-2222-2222-2222-222222222222', '30000003-3333-3333-3333-333333333333', now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333', '10000001-1111-1111-1111-111111111111', now() - interval '5 days'),
  ('33333333-3333-3333-3333-333333333333', '40000004-4444-4444-4444-444444444444', now() - interval '8 days')
ON CONFLICT DO NOTHING;

-- Insert play history
INSERT INTO play_history (user_id, video_id, seconds_watched, last_position, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '40000004-4444-4444-4444-444444444444', 3200, 3200, now() - interval '2 hours'),
  ('11111111-1111-1111-1111-111111111111', '70000007-7777-7777-7777-777777777777', 4500, 4500, now() - interval '5 hours'),
  ('22222222-2222-2222-2222-222222222222', '10000001-1111-1111-1111-111111111111', 1800, 2100, now() - interval '1 hour'),
  ('33333333-3333-3333-3333-333333333333', '30000003-3333-3333-3333-333333333333', 4200, 4200, now() - interval '3 hours')
ON CONFLICT (user_id, video_id) DO NOTHING;

-- Insert comments
INSERT INTO comments (video_id, user_id, body, created_at) VALUES
  ('10000001-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Great tutorial! Very comprehensive and well explained.', now() - interval '6 days'),
  ('10000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'This helped me understand Server Components much better!', now() - interval '5 days'),
  ('30000003-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Amazing deep dive! Looking forward to more React content.', now() - interval '2 days'),
  ('40000004-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'The Figma to React workflow is exactly what I needed.', now() - interval '9 days'),
  ('70000007-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Docker finally makes sense after this video!', now() - interval '11 days'),
  ('70000007-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Clear and concise explanations. Thank you!', now() - interval '10 days')
ON CONFLICT DO NOTHING;
