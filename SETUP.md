# Stoa Setup Guide

Complete step-by-step instructions to deploy Stoa from scratch.

## Prerequisites

- GitHub account
- Supabase account (free tier works)
- Vercel account (free tier works)
- Node.js 20+ installed locally

## Step 1: Create GitHub Repository

**Time: 2 minutes**

1. Go to [github.com](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `stoa`
4. Choose **Private** or **Public** (your preference)
5. **Do NOT** initialize with README (we already have one)
6. Click **Create repository**

7. Push the local code:
```bash
cd ~/stoa
git init
git add .
git commit -m "Initial commit: Stoa MVP"
git remote add origin https://github.com/YOUR_USERNAME/stoa.git
git branch -M main
git push -u origin main
```

✅ **Verify:** Visit your repo URL and see all files

---

## Step 2: Create Supabase Project

**Time: 5 minutes**

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name:** stoa
   - **Database Password:** (generate a strong one)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free
4. Click **Create new project**
5. Wait 2-3 minutes for setup

### Run the Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Open `~/stoa/supabase/schema.sql` locally
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

✅ **Verify:** Go to **Table Editor** and see `tasks`, `comments`, `task_history`, `config_files` tables

### Save Credentials

1. Go to **Settings** → **API**
2. Copy these three values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`, keep this SECRET)

3. Save them securely:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (KEEP SECRET)
```

---

## Step 3: Configure GitHub OAuth

**Time: 10 minutes**

### Create GitHub OAuth App

1. Go to GitHub **Settings** → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** Stoa
   - **Homepage URL:** `http://localhost:3000` (we'll update this later)
   - **Authorization callback URL:** `https://[your-project-ref].supabase.co/auth/v1/callback`
     - Replace `[your-project-ref]` with your Supabase project reference (from Project URL)
     - Example: `https://abcdefgh.supabase.co/auth/v1/callback`
4. Click **Register application**

5. On the next page:
   - Copy **Client ID**
   - Click **Generate a new client secret**
   - Copy **Client Secret** (you'll only see this once!)

### Connect to Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **GitHub** in the list
3. Toggle it **ON**
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

✅ **Verify:** GitHub should show as "Enabled" in Supabase Auth providers

---

## Step 4: Test Locally

**Time: 5 minutes**

1. Create `.env.local` file:
```bash
cd ~/stoa
cp .env.local.example .env.local
```

2. Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

3. Install dependencies and run:
```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

5. Test the flow:
   - Click **Sign in with GitHub**
   - Authorize the app
   - You should be redirected to the dashboard
   - Try creating a task
   - Try dragging it between columns
   - Open in another browser window → verify real-time sync

✅ **Verify:** Everything works locally with no errors

---

## Step 5: Deploy to Vercel

**Time: 5 minutes**

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd ~/stoa
vercel
```

3. Follow the prompts:
   - **Set up and deploy?** Yes
   - **Which scope?** Your account
   - **Link to existing project?** No
   - **Project name?** stoa
   - **Directory?** ./
   - **Override settings?** No

4. Add environment variables:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service key
```

5. Deploy to production:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository (`stoa`)
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** (leave default)
   - **Output Directory:** (leave default)
5. Add **Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` → Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → Your service key
6. Click **Deploy**

✅ **Verify:** Wait 2-3 minutes, then visit your Vercel URL

---

## Step 6: Update OAuth Callback

**Time: 2 minutes**

Now that you have a production URL, update the GitHub OAuth app:

1. Go to GitHub **Settings** → **Developer settings** → **OAuth Apps**
2. Click on your **Stoa** app
3. Update **Homepage URL:** `https://your-app.vercel.app`
4. **Authorization callback URL** should still be the Supabase URL (no change needed)
5. Click **Update application**

Also update Supabase:

1. Go to Supabase **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL:** `https://your-app.vercel.app`
3. Add to **Redirect URLs:** `https://your-app.vercel.app/**`
4. Click **Save**

---

## Step 7: Test Production

**Time: 5 minutes**

1. Visit your production URL: `https://your-app.vercel.app`
2. Click **Sign in with GitHub**
3. Authorize (if needed)
4. Create a task
5. Drag it between columns
6. Open on mobile → verify responsive design
7. Open in incognito → verify you can't access without login

✅ **Verify:** Production works exactly like local

---

## Step 8: Configure Marcus Integration

**Time: 5 minutes**

Marcus needs the Supabase credentials to interact with Stoa programmatically.

### For JavaScript/TypeScript (OpenClaw)

1. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Create a client:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-service-role-key'  // Use SERVICE key for full access
)
```

3. Test it:
```typescript
// Get all tasks
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .order('created_at', { ascending: false })

console.log(`Found ${tasks.length} tasks`)
```

### Add to Marcus's Heartbeat

In Marcus's heartbeat check (every 30 min):

```typescript
// Check for urgent tasks
const { data: urgentTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('priority', 'high')
  .eq('status', 'todo')
  .order('created_at', { ascending: false })

if (urgentTasks.length > 0) {
  console.log(`${urgentTasks.length} urgent tasks need attention:`)
  urgentTasks.forEach(task => {
    console.log(`- ${task.title}`)
  })
  // Take action
}
```

---

## Troubleshooting

### "Failed to fetch" errors

**Cause:** Environment variables not set correctly

**Fix:**
1. Check `.env.local` (local) or Vercel environment variables (production)
2. Make sure variables start with `NEXT_PUBLIC_` for client-side access
3. Restart dev server after changing `.env.local`
4. Redeploy on Vercel after changing environment variables

### GitHub OAuth redirect fails

**Cause:** Callback URL mismatch

**Fix:**
1. In GitHub OAuth app, verify callback URL matches exactly:
   `https://[project-ref].supabase.co/auth/v1/callback`
2. In Supabase Auth settings, verify GitHub is enabled
3. Check Site URL and Redirect URLs are correct

### Real-time updates not working

**Cause:** Supabase Realtime not enabled or RLS policies blocking

**Fix:**
1. Go to Supabase **Database** → **Replication**
2. Enable replication for `tasks` table
3. Verify RLS policies allow authenticated reads
4. Check browser console for WebSocket errors

### "Invalid login credentials"

**Cause:** GitHub OAuth not configured properly

**Fix:**
1. Verify Client ID and Secret in Supabase match GitHub OAuth app
2. Make sure you clicked "Save" in both GitHub and Supabase
3. Try revoking and re-authorizing the app
4. Check Supabase Auth logs for specific error

### Build fails on Vercel

**Cause:** TypeScript errors or missing dependencies

**Fix:**
1. Run `npm run build` locally first
2. Fix any TypeScript errors
3. Make sure `package.json` has all dependencies
4. Check Vercel build logs for specific error
5. Ensure Node.js version matches (20+)

---

## Success Checklist

- [ ] GitHub repository created and code pushed
- [ ] Supabase project created
- [ ] Database schema run successfully
- [ ] GitHub OAuth app created
- [ ] OAuth connected to Supabase
- [ ] Tested locally (login, tasks, real-time)
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Production login works
- [ ] Production task creation works
- [ ] Real-time updates work
- [ ] Mobile responsive verified
- [ ] Marcus can access via API

---

## Credentials Template

Save these securely (password manager recommended):

```
PROJECT: Stoa

GITHUB REPO:
https://github.com/YOUR_USERNAME/stoa

PRODUCTION URL:
https://your-app.vercel.app

SUPABASE:
Project: stoa
URL: https://your-project.supabase.co
Anon Key: eyJhbGc...
Service Key: eyJhbGc... (SECRET)
Database Password: (your generated password)

GITHUB OAUTH:
Client ID: Iv1.abc123...
Client Secret: (secret) abc123...
Callback: https://your-project.supabase.co/auth/v1/callback

VERCEL:
Project: stoa
URL: https://your-app.vercel.app
```

---

## Next Steps

1. **Use it!** Create tasks, organize work
2. **Integrate Marcus:** Add to heartbeat checks
3. **Customize:** Adjust colors, add categories
4. **Plan Phase 2:** Comments, recurring tasks, file editor

---

**Need help?** Check the main [README.md](./README.md) for API examples and architecture details.

**Estimated total setup time: ~30 minutes**
