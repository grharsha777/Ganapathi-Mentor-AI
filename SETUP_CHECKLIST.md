# Analytics Pro - Setup Checklist

Complete this checklist to get your analytics platform live.

## Before You Start
- [ ] Have a Supabase account (create free at supabase.com)
- [ ] Have a GitHub account for code storage
- [ ] Have a Vercel account (free tier works)

## Step 1: Local Setup (5 min)
- [ ] Download code from v0 or clone from GitHub
- [ ] Run `npm install`
- [ ] Verify Next.js project runs with `npm run dev`

## Step 2: Supabase Configuration (3 min)
- [ ] Create new Supabase project
- [ ] Go to Settings → API
- [ ] Copy `Project URL`
- [ ] Copy `anon key` (public)
- [ ] Copy `service_role key` (secret)

## Step 3: Environment Variables in v0 (2 min)
- [ ] In v0 sidebar, click "Vars"
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Click outside to save

## Step 4: Database Setup (Automatic)
- [ ] Database schema auto-initializes on first app run
- [ ] No manual SQL needed
- [ ] Verify by signing up in app

## Step 5: Test Locally (3 min)
- [ ] Visit http://localhost:3000
- [ ] Click "Get Started"
- [ ] Create account with test email
- [ ] Should redirect to dashboard
- [ ] Create a new team
- [ ] Verify dashboard loads

## Step 6: Push to GitHub (2 min)
- [ ] Run `git add .`
- [ ] Run `git commit -m "Initial commit"`
- [ ] Run `git push origin main`

## Step 7: Deploy to Vercel (5 min)
- [ ] Visit vercel.com
- [ ] Click "New Project"
- [ ] Select "Import Git Repository"
- [ ] Choose your repository
- [ ] Add Environment Variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL` (your Vercel domain)
- [ ] Click Deploy

## Step 8: Configure Supabase for Production (2 min)
- [ ] Go back to Supabase project
- [ ] Click Settings → Authentication
- [ ] Find "URL Configuration" section
- [ ] Add Site URL: `https://your-domain.vercel.app`
- [ ] Add Redirect URL: `https://your-domain.vercel.app`
- [ ] Save

## Step 9: Test Production (2 min)
- [ ] Visit your Vercel domain
- [ ] See the landing page
- [ ] Click "Get Started"
- [ ] Create account with test email
- [ ] Should redirect to dashboard

## Step 10: Optional - Add Sample Data (1 min)
- [ ] Go to Supabase → SQL Editor
- [ ] Create new query
- [ ] Paste contents of `scripts/seed-data.sql`
- [ ] Run query
- [ ] Refresh dashboard to see sample metrics

## Verification Checklist
- [ ] Homepage loads at root domain
- [ ] Authentication works (sign up → redirect)
- [ ] Dashboard loads after login
- [ ] Can create teams
- [ ] Alerts page loads
- [ ] Team management page loads
- [ ] Settings page loads
- [ ] Can sign out successfully
- [ ] Charts display (if seed data added)

## Troubleshooting Quick Fixes

### If homepage is blank:
1. Check browser console for errors (F12)
2. Verify env variables in Vercel
3. Redeploy

### If authentication fails:
1. Check Supabase credentials are correct
2. Verify email is valid
3. Check Supabase project is active

### If dashboard is empty:
1. Add sample data using `seed-data.sql`
2. Create a metric manually
3. Check team is selected

### If charts don't show:
1. Seed sample data
2. Clear browser cache
3. Refresh page

## Production Readiness
- [ ] Custom domain configured (optional)
- [ ] Email confirmations enabled (Supabase settings)
- [ ] RLS policies verified in Supabase
- [ ] Database backups enabled
- [ ] Error monitoring set up
- [ ] Custom branding applied

## After Going Live
1. Share your app URL
2. Invite team members
3. Start tracking metrics
4. Set up alerts
5. Monitor performance

## Support Resources
- README.md - Full documentation
- DEPLOYMENT.md - Deployment guide
- Supabase docs - supabase.com/docs
- Next.js docs - nextjs.org/docs
- Vercel docs - vercel.com/docs

## Your Deployment URL
```
https://your-app-name-xxxx.vercel.app
```

Share this link with your team!

## Estimated Time
Total setup time: **25 minutes**
- Local setup: 5 min
- Supabase config: 3 min
- Environment variables: 2 min
- Local testing: 3 min
- GitHub push: 2 min
- Vercel deployment: 5 min
- Supabase production config: 2 min
- Final testing: 2 min
- Optional sample data: 1 min

Congratulations! Your analytics platform is live! 🚀
