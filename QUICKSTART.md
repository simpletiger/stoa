# Stoa Dashboard - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies (if not done)
```bash
cd ~/stoa
npm install
```

### 2. Apply Database Migration

**Option A: Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard
2. Select your Stoa project
3. Click "SQL Editor" → "New query"
4. Copy and paste contents of `supabase/migrations/20260203_file_changes.sql`
5. Click "Run" (Cmd/Ctrl + Enter)

**Option B: Command Line (if linked)**
```bash
npx supabase db push
```

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📱 Navigation

### Desktop
- **Sidebar:** Fixed on the left side
- **Click:** Any navigation item to switch sections

### Mobile
- **Hamburger Menu:** Top-left corner (three lines icon)
- **Tap:** Menu item to navigate, auto-closes menu

## ✏️ Editing Files

### Soul Tab (`/soul`)
1. Click "Soul" in sidebar
2. Edit content in left panel (markdown)
3. See live preview in right panel
4. Changes auto-enable "Save" button
5. Click "Save" to write to disk + log to Supabase
6. Status updates: Saving → Saved (3s) → Idle

### Agents Tab (`/agents`)
- Same as Soul tab
- Edits `~/clawd/AGENTS.md`

## 🎨 Theme

- **Pure Black Background:** #000000
- **White Text:** #ffffff
- **Active Items:** White background, black text
- **Subtle Grays:** #737373 for muted text

## 🔍 What's Working

✅ **Tasks Tab** - Existing Kanban board (unchanged)  
✅ **Soul Tab** - Edit SOUL.md with live preview  
✅ **Agents Tab** - Edit AGENTS.md with live preview  
⏳ **Memory Tab** - Coming in Phase 2  
⏳ **Skills Tab** - Coming in Phase 2  
⏳ **Config Tab** - Coming in Phase 2  

## 🛠️ Development

### Build for Production
```bash
npm run build
npm start
```

### Type Check
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
rm -rf .next
npm run build
```

### Database permission errors
- Check RLS policies in Supabase dashboard
- Verify you're logged in (authentication required)

### File save fails
- Check file permissions: `ls -la ~/clawd/SOUL.md`
- Verify path exists: `~/clawd/`
- Check API logs in terminal

## 📊 Monitoring Changes

### View Recent File Changes
Run in Supabase SQL editor:
```sql
SELECT 
  file_path,
  file_type,
  changed_at,
  users.email as changed_by
FROM file_changes
LEFT JOIN auth.users ON file_changes.changed_by = users.id
ORDER BY changed_at DESC
LIMIT 20;
```

### Track Specific User
```sql
SELECT * FROM file_changes
WHERE changed_by = 'USER_UUID_HERE'
ORDER BY changed_at DESC;
```

### Today's Changes
```sql
SELECT * FROM file_changes
WHERE changed_at > CURRENT_DATE
ORDER BY changed_at DESC;
```

## 🔗 Integration with Marcus

### Polling for Changes
Marcus can check for new file changes:

```typescript
// Pseudocode for Marcus
const lastCheck = getLastCheckTime()
const changes = await supabase
  .from('file_changes')
  .select('*')
  .gt('changed_at', lastCheck)
  .order('changed_at', { ascending: false })

if (changes.length > 0) {
  // Reload changed files
  for (const change of changes) {
    if (change.file_type === 'soul') {
      await reloadSoulMd()
    } else if (change.file_type === 'agents') {
      await reloadAgentsMd()
    }
  }
  
  updateLastCheckTime(new Date())
}
```

### Real-time Subscription
For instant updates:

```typescript
// Marcus subscribes to file_changes
const channel = supabase
  .channel('file-changes')
  .on(
    'postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'file_changes' 
    },
    (payload) => {
      console.log('File changed:', payload.new)
      // Reload the changed file immediately
      reloadFile(payload.new.file_path)
    }
  )
  .subscribe()
```

## 📂 File Locations

- **Soul:** `~/clawd/SOUL.md`
- **Agents:** `~/clawd/AGENTS.md`
- **Memory:** `~/clawd/memory/` (Phase 2)
- **Config:** TBD (Phase 2)

## 🎯 Next Steps

1. Apply the database migration
2. Test Soul and Agents tabs
3. Verify changes save correctly
4. Wait for Phase 2 (Memory, Skills, Config tabs)

## 💡 Tips

- **Keyboard Shortcut:** Cmd/Ctrl + S doesn't work yet (but Save button does)
- **Mobile Editing:** Works, but desktop is more comfortable for long edits
- **Preview:** Updates as you type (real-time)
- **Character Count:** Bottom of editor shows stats
- **Undo/Redo:** Browser's native undo works in textarea

## 📞 Support

If something breaks:
1. Check terminal for error messages
2. Check browser console (F12)
3. Verify Supabase connection
4. Check file permissions
5. See PROGRESS.md for known issues

---

**Version:** 0.2.0  
**Phase:** 1 Complete, 2 In Progress  
**Last Updated:** February 3, 2026
