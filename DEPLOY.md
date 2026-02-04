# Stoa - Quick Deployment Checklist

**Estimated time: 30 minutes**

## ✅ Pre-Deployment Checklist

- [x] Code complete and tested locally
- [x] Production build successful (`npm run build`)
- [x] Git repository initialized
- [x] All files committed

## 📋 Deployment Steps

### 1. Create GitHub Repository (2 min)

```bash
# Go to github.com and create new repo "stoa"
# Then push:
cd ~/stoa
git remote add origin https://github.com/YOUR_USERNAME/stoa.git
git branch -M main
git push -u origin main
```

### 2. Create Supabase Project (5 min)

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Name: `stoa`
4. Generate strong database password
5. Choose region closest to you
6. Wait for project creation (~2 min)

7. Run database schema:
   - Go to **SQL Editor**
   - Click **New query**
   - Copy entire contents of `supabase/schema.sql`
   - Paste and click **Run**

8. Save credentials:
   - Go to **Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key
   - Copy **service_role** key (keep secret!)

### 3. Configure GitHub OAuth (10 min)

1. **Create OAuth App:**
   - GitHub Settings → Developer settings → OAuth Apps
   - Click **New OAuth App**
   - Name: `Stoa`
   - Homepage: `http://localhost:3000` (temporary)
   - Callback: `https://[project-ref].supabase.co/auth/v1/callback`
   - Click **Register application**
   - Copy **Client ID**
   - Generate and copy **Client Secret**

2. **Connect to Supabase:**
   - Supabase: **Authentication** → **Providers**
   - Find **GitHub** and toggle **ON**
   - Paste Client ID and Secret
   - Click **Save**

### 4. Deploy to Vercel (5 min)

**Option A: CLI**
```bash
npm install -g vercel
cd ~/stoa
vercel

# Add environment variables:
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service key

# Deploy to production:
vercel --prod
```

**Option B: Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Add environment variables (all three)
4. Click **Deploy**

### 5. Update URLs (2 min)

1. **GitHub OAuth App:**
   - Update Homepage URL: `https://your-app.vercel.app`
   - Callback stays the same (Supabase URL)

2. **Supabase:**
   - **Authentication** → **URL Configuration**
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### 6. Test Production (5 min)

- [ ] Visit production URL
- [ ] Click **Sign in with GitHub**
- [ ] Authorize app
- [ ] Create a task
- [ ] Drag task between columns
- [ ] Test on mobile device
- [ ] Verify real-time updates (open two browser windows)

---

## 🔑 Credentials to Save

```
PROJECT: Stoa

GITHUB REPO:
https://github.com/YOUR_USERNAME/stoa

PRODUCTION URL:
https://your-app.vercel.app

SUPABASE:
URL: https://[project].supabase.co
Anon Key: eyJ...
Service Key: eyJ... (SECRET - for Marcus)

GITHUB OAUTH:
Client ID: Iv1...
Client Secret: (secret)

VERCEL:
Project: stoa
URL: https://your-app.vercel.app
```

---

## 🧠 Marcus Integration

### Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Create Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-service-role-key'  // Use SERVICE key
)
```

### Example Heartbeat Check

```typescript
// Check every 30 minutes
const { data: urgentTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('priority', 'high')
  .eq('status', 'todo')
  .order('created_at', { ascending: false })

if (urgentTasks.length > 0) {
  console.log(`${urgentTasks.length} urgent tasks waiting`)
}
```

---

## 🎯 Success Criteria

- [ ] Production URL accessible
- [ ] GitHub OAuth login works
- [ ] Can create/edit/delete tasks
- [ ] Drag-and-drop works
- [ ] Real-time updates work
- [ ] Mobile responsive
- [ ] Marcus can access via API

---

## 🚨 Troubleshooting

**Build fails:** Check environment variables
**OAuth fails:** Verify callback URL matches exactly
**Real-time doesn't work:** Enable replication in Supabase Database settings
**404 on production:** Wait 30 seconds for deployment to complete

---

## 📚 Next Steps

1. **Use it!** Start creating tasks
2. **Integrate Marcus:** Add to heartbeat
3. **Plan Phase 2:** Comments, recurring tasks, file editor

---

**Total Time:** ~30 minutes  
**Status:** Code complete, ready to deploy  
**Built:** 2026-02-03
