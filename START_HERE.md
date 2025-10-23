# 🎯 START HERE - StreamHub Deployment

Welcome! This is your complete video streaming platform. Here's how to get it running.

## 🚀 Choose Your Path

### I want to deploy to bolt.new RIGHT NOW
→ Read: **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** (3-minute quick guide)

### I want to run locally first
→ Read: **[QUICKSTART.md](./QUICKSTART.md)** (5-minute setup)

### I need complete deployment documentation
→ Read: **[DEPLOYMENT.md](./DEPLOYMENT.md)** (comprehensive guide)

---

## ⚡ Super Quick Deploy (bolt.new)

### 1. Supabase Setup (5 minutes)
1. Create project at https://supabase.com
2. Run 9 migration files from `supabase/migrations/`
3. Run `supabase/setup-storage.sql`
4. Copy URL and keys

### 2. bolt.new Configuration (2 minutes)
Add environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_APP_URL=https://your-app.bolt.new
```

Set build command: `npm run build`

### 3. Deploy (3 minutes)
Click "Publish" and wait for build to complete.

**Done!** Your video streaming platform is live.

---

## 📋 Pre-Deployment Checklist

Before deploying, you need:

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Database migrations run (9 files)
- [ ] Storage buckets created
- [ ] Environment variables ready
- [ ] Build command set to `npm run build`

---

## 🎯 What You Get

**StreamHub** is a complete video streaming platform with:

- ✅ Video upload & streaming
- ✅ Live streaming (RTMP)
- ✅ User authentication
- ✅ Channel management
- ✅ Comments & likes
- ✅ Analytics dashboard
- ✅ Content moderation
- ✅ Legal compliance (GDPR, cookie consent, age gate)
- ✅ Dark mode
- ✅ Responsive design

---

## 📚 Documentation Index

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** | Quick deploy to bolt.new | 3 min |
| **[QUICKSTART.md](./QUICKSTART.md)** | Local development setup | 5 min |
| **[BOLT_DEPLOYMENT.md](./BOLT_DEPLOYMENT.md)** | bolt.new specific guide | 10 min |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Complete deployment guide | 20 min |
| **[ENV_VARS.md](./ENV_VARS.md)** | Environment variables reference | 5 min |
| **[TESTING.md](./TESTING.md)** | Testing guide | 10 min |
| **[README.md](./README.md)** | Project overview | 5 min |

---

## ⚠️ Critical Build Information

**Build Command:** `npm run build`

**Note:** The project uses Next.js 15 to avoid Turbopack WASM binding issues that exist in Next.js 16 on bolt.new. This ensures stable builds across all deployment platforms.

---

## 🆘 Having Issues?

### Build fails with "turbo.createProject" error
→ See: [BOLT_DEPLOYMENT.md](./BOLT_DEPLOYMENT.md) Troubleshooting section

### "Website not found" after deploy
→ Check: Environment variables are set and Supabase is configured

### Database errors
→ Verify: All 9 migration files were run in Supabase

### Videos won't upload
→ Check: Storage buckets were created (`setup-storage.sql`)

### Can't sign in
→ Verify: Email auth is enabled in Supabase → Authentication → Providers

---

## 🎓 Learning Path

**Day 1:** Get it deployed
1. Read [DEPLOY_NOW.md](./DEPLOY_NOW.md)
2. Set up Supabase
3. Deploy to bolt.new
4. Verify it works

**Day 2:** Understand the code
1. Read [README.md](./README.md)
2. Explore the project structure
3. Check out the features

**Day 3:** Customize it
1. Update branding
2. Modify features
3. Add your own touches

**Week 2:** Scale it
1. Review [DEPLOYMENT.md](./DEPLOYMENT.md) performance section
2. Set up monitoring
3. Configure CDN
4. Plan for growth

---

## 💡 Pro Tips

1. **Test locally first** - It's faster to debug locally than on deployment
2. **Set up Supabase completely** - Most issues come from incomplete database setup
3. **Use the dev data seed** - Run `20251022180149_seed_dev_data.sql` for test data
4. **Check environment variables** - Rebuild after adding any NEXT_PUBLIC_* vars
5. **Monitor Supabase logs** - Dashboard → Logs shows all database activity

---

## 🏁 Ready to Deploy?

1. Open **[DEPLOY_NOW.md](./DEPLOY_NOW.md)**
2. Follow the steps
3. Deploy in 10 minutes

Good luck! 🚀

---

## 📞 Need Help?

- Check troubleshooting sections in deployment guides
- Review Supabase logs for database errors
- Verify all environment variables are set
- Confirm all migration files were run

**Remember:** Most deployment issues are due to:
1. Missing environment variables
2. Database migrations not run
3. Storage buckets not created
4. Wrong build command

Double-check these first!
