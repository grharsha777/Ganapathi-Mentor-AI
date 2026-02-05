# Deployment Guide - Analytics Pro

## Quick Start (5 minutes)

### 1. Download & Setup Locally

```bash
# Download from v0 (Download ZIP or use GitHub)
npm install
npm run dev
```

Visit `http://localhost:3000` to test locally.

### 2. Get Supabase Credentials

1. Create free account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API → Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Environment Variables in v0

In v0 chat:
- Click sidebar → "Vars"
- Add the 3 environment variables above

The database schema will initialize automatically.

### 4. Test Locally

```bash
npm run dev
# Visit http://localhost:3000
# Sign up and create a team
# Try adding metrics via dashboard
```

### 5. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Analytics Pro"
git push origin main

# Visit vercel.com → New Project → Import Git Repo
# Add same 3 environment variables
# Plus: NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.com
```

### 6. Configure Supabase (30 seconds)

In Supabase Dashboard:
- Go to Authentication → URL Configuration
- Add your Vercel URL to "Site URL" and "Redirect URLs"

Example:
```
https://analytics-pro-abc123.vercel.app
```

Done! Your app is live.

## What Gets Deployed

When you push to GitHub and deploy to Vercel, this includes:

✅ Full-stack Next.js app
✅ Database schema (automatic on first run)
✅ Authentication system
✅ Real-time charts and dashboards
✅ Team management
✅ Alert system
✅ API routes
✅ Row-level security

## Environment Variables Explained

| Variable | Where to find | Usage |
|----------|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | Database connection (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Auth & client operations (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | Server-side operations (secret) |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL | Email redirects & auth callbacks |

## After Deployment

### 1. Verify Setup
- Visit your Vercel URL
- You should see landing page
- Click "Get Started" → Create account
- Should redirect to dashboard

### 2. Test Features
- Create a new team
- See sample metrics on dashboard (if seed data was added)
- Try creating alerts
- Test team management

### 3. Optional Customizations
- Add seed data: Use Supabase SQL Editor to run `scripts/seed-data.sql`
- Update branding: Edit `components/dashboard/sidebar.tsx`
- Add custom domain: Configure in Vercel project settings

## Troubleshooting Deployments

### "Environment variables not found"
```
Vercel Dashboard → Project Settings → Environment Variables
Make sure all 3 variables are added and deployed
```

### "Database connection failed"
```
1. Check SUPABASE_URL is correct
2. Verify Supabase project is active
3. Check credentials haven't been regenerated
```

### "Auth redirect not working"
```
1. Add your Vercel URL to Supabase:
   Settings → Authentication → URL Configuration
2. Set NEXT_PUBLIC_SITE_URL in Vercel env vars
3. Redeploy after changes
```

### "Charts not showing"
```
1. Seed sample data: Use Supabase SQL Editor
2. Run: scripts/seed-data.sql
3. Refresh dashboard
```

## Production Checklist

Before sharing your app:

- [ ] Environment variables set in Vercel
- [ ] Supabase URL configuration updated
- [ ] At least one user account created
- [ ] Test sign up, sign in, sign out
- [ ] Test creating team and metrics
- [ ] Check alerts system works
- [ ] Custom domain configured (optional)
- [ ] Email confirmations enabled (optional)

## Scaling Up

### When you need more:

1. **More users** - Supabase scales automatically
2. **Custom domain** - Vercel domains section
3. **Email alerts** - Add SendGrid/Mailgun via API
4. **Real-time updates** - Supabase Realtime subscriptions
5. **Analytics integration** - Connect to Segment/Mixpanel
6. **Webhook support** - Add API routes for 3rd party webhooks

## Support

- Stuck? Check README.md for detailed docs
- Issues? Check Vercel and Supabase dashboards for error logs
- Questions? Use v0 chat for code changes

## Next Deployments

After initial deployment, any changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel automatically redeploys
```

That's it! 🚀

---

**Vercel-specific Quick Setup (automated option)**

1. Install the Vercel CLI (optional, for CLI deployment):

```bash
npm i -g vercel
```

2. Log in and link project (CLI):

```bash
vercel login
cd "c:\\Users\\G R  HARSHA\\OneDrive\\Desktop\\Ganapathi Mentor AI\\neural-code-symbiosis"
vercel link # link to an existing project or create a new one interactively
```

3. Set environment variables with the Vercel CLI (example):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production
```

4. Deploy (CLI):

```bash
vercel --prod
```

Notes:
- If you prefer the dashboard, import the GitHub repo and add environment variables in Project Settings → Environment Variables.
- Ensure `NEXT_PUBLIC_SITE_URL` matches the Vercel production domain you use for Supabase redirect URLs.

**Security note:** Do not commit secrets into the repository. Use environment variables in Vercel and Supabase Dashboard.
