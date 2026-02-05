# Analytics Pro - Enterprise Dashboard

A full-stack analytics platform built with Next.js 16, Supabase, and TypeScript. Production-ready with authentication, real-time data visualization, team management, and alerts.

## Features

- **Executive Dashboard** - Real-time metrics with beautiful visualizations
- **Real-time Data Visualization** - Interactive charts showing performance trends
- **Team Management** - Role-based access control and team collaboration
- **Alerts & Notifications** - Configurable alerts with severity levels
- **User Authentication** - Secure authentication with Supabase Auth
- **Row Level Security** - Database-level security with RLS policies

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **UI Components**: shadcn/ui
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Supabase account (free tier available)
- Git

## Local Development

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd analytics-pro
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project credentials
3. In v0 UI sidebar → Vars section, set these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for server operations)

### 3. Set Up Database

The database schema is automatically initialized. Run the migration script:

```bash
# Option 1: Use Supabase SQL Editor (recommended)
# Open Supabase Dashboard → SQL Editor
# Paste contents of scripts/init-database.sql and execute

# Option 2: Use v0 system
# The scripts/init-database.sql has been executed automatically
```

### 4. (Optional) Seed Sample Data

To populate the dashboard with sample metrics and alerts:

```bash
# In Supabase SQL Editor, paste and execute:
# scripts/seed-data.sql
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

### Sign Up
1. Visit `/auth/sign-up`
2. Enter email, password, and full name
3. You'll be redirected to sign-up-success page
4. Confirm your email (if using production Supabase)

### Sign In
1. Visit `/auth/login`
2. Enter your credentials
3. Redirected to dashboard after successful login

### Sign Out
- Use the dropdown menu in the dashboard header

## Project Structure

```
├── app/
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── error/
│   │   └── actions.ts
│   ├── api/               # API routes
│   │   ├── metrics/
│   │   ├── alerts/
│   │   └── teams/
│   ├── dashboard/         # Main dashboard
│   │   ├── alerts/
│   │   ├── team/
│   │   ├── settings/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx          # Home page
├── components/
│   ├── dashboard/        # Dashboard components
│   │   ├── nav.tsx
│   │   ├── sidebar.tsx
│   │   ├── team-selector.tsx
│   │   ├── metrics-chart.tsx
│   │   └── alerts-list.tsx
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Browser client
│   │   ├── server.ts    # Server client
│   │   └── proxy.ts     # Session handling
│   └── utils.ts
├── scripts/
│   ├── init-database.sql
│   └── seed-data.sql
├── middleware.ts
└── README.md
```

## Database Schema

### Tables

- **users** - User profiles linked to auth.users
- **teams** - Team information and ownership
- **team_members** - Team membership with roles
- **metrics** - Performance metrics with timestamps
- **alerts** - Alert notifications and events
- **team_alert_settings** - Alert threshold configurations

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only view their own profile
- Users can only access teams they're members of
- Team members can view and create metrics
- Team members can view and create alerts

## API Routes

### Metrics
- `GET /api/metrics?teamId={id}` - Get team metrics
- `POST /api/metrics` - Create new metric

### Alerts
- `GET /api/alerts?teamId={id}` - Get team alerts
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts` - Mark alert as read

### Teams
- `GET /api/teams` - Get user's teams
- `POST /api/teams` - Create new team

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

### Optional
- `NEXT_PUBLIC_SITE_URL` - Your deployment URL (for email redirects)

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. Add environment variables in the "Environment Variables" section:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel domain)

### Step 3: Configure Supabase

In your Supabase project settings, add your Vercel domain to:
- Authentication → Site URL
- Authentication → Redirect URLs

## Performance Optimization

- Server-side data fetching with Next.js Server Components
- Client-side caching with SWR patterns
- Database indexes on frequently queried columns
- 30-second polling interval for dashboard updates
- Recharts for optimized data visualization

## Security

- Row Level Security (RLS) on all database tables
- Supabase Auth with secure session management
- Server-side API routes with authentication checks
- CSRF protection via middleware
- No sensitive data in client-side code

## Monitoring & Debugging

### Enable Debug Logging

Add `console.log("[v0] ...")` statements in components to trace execution flow.

### Check Database

Use Supabase dashboard to:
- Monitor real-time data
- Inspect RLS policies
- View error logs

### Check Deployment

Use Vercel dashboard to:
- View deployment logs
- Monitor function durations
- Check error rates

## Common Issues

### "NEXT_PUBLIC_SUPABASE_URL not found"
- Check environment variables in Vercel project settings
- Ensure variables are properly set with correct names

### "User not authenticated"
- Clear browser cookies and sign in again
- Check Supabase auth settings

### "RLS policy denied"
- Verify user is member of team
- Check RLS policies in Supabase SQL Editor

### "Metrics not loading"
- Ensure metrics exist for selected team
- Check browser console for API errors
- Verify team_id is correct

## Support

- Issues? Check the README sections above
- Error messages? Look at browser console and Vercel logs
- Database issues? Use Supabase SQL Editor to debug

## License

MIT

## Next Steps

1. Customize branding in components/dashboard/sidebar.tsx
2. Add more metric types and categories
3. Implement email alerts
4. Add user preferences/themes
5. Create admin dashboard
6. Set up webhook integrations
