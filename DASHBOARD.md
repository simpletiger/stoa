# Stoa Dashboard - Technical Documentation

## Overview

Stoa has been transformed from a simple task manager into a complete Marcus management dashboard with six main sections accessible via sidebar navigation.

## Architecture

### Navigation Structure

```
/                  → Tasks (Kanban Board)
/soul              → Soul Editor (SOUL.md)
/agents            → Agents Editor (AGENTS.md)
/memory            → Memory Browser (coming soon)
/skills            → Skills Dashboard (coming soon)
/config            → Config Editor (coming soon)
```

### Layout System

- **Root Layout**: `app/layout.tsx` - Global layout with auth
- **Dashboard Layout**: `app/(dashboard)/layout.tsx` - Includes Sidebar + Header
- **Page Routes**: Each section in `app/(dashboard)/{section}/`

### Components

#### Sidebar (`components/Sidebar.tsx`)
- Fixed left sidebar (desktop), slide-over menu (mobile)
- Active route highlighting with white background
- Icons from lucide-react
- Responsive with hamburger menu for mobile
- System status indicator at bottom

#### Editors (Soul & Agents)
Both editors share the same structure:
- **Split view**: Editor (left) | Preview (right)
- **Real-time preview**: Using react-markdown
- **Auto-save**: Saves to file system via API
- **Change tracking**: Logs to Supabase `file_changes` table
- **Status indicators**: Idle / Saving / Saved / Error
- **Statistics**: Character count, line count

### API Endpoints

#### `/api/files/save` (POST)
Saves markdown files and tracks changes.

**Request:**
```json
{
  "path": "/Users/marcusaurelius/clawd/SOUL.md",
  "content": "# SOUL.md\n...",
  "type": "soul" | "agents" | "memory"
}
```

**Response:**
```json
{
  "success": true
}
```

**Behavior:**
1. Verifies user authentication
2. Writes file to disk using fs/promises
3. Logs change to `file_changes` table in Supabase
4. Returns success/error status

### Database Schema

#### `file_changes` Table
Tracks all file modifications made through Stoa.

```sql
CREATE TABLE file_changes (
  id UUID PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_type TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_file_changes_changed_at` - Recent changes first
- `idx_file_changes_file_type` - Filter by type
- `idx_file_changes_changed_by` - Per-user tracking

**RLS Policies:**
- All authenticated users can view changes
- Users can only insert their own changes

### Styling

**Theme:** Pure black/white with subtle grays
- Background: `#000000`
- Surface: `#0a0a0a`
- Surface Elevated: `#141414`
- Foreground: `#ffffff`
- Foreground Muted: `#737373`
- Border: `#1f1f1f`

**Color Accents:**
- Green: `#22c55e` - Active/success states
- Red: `#ef4444` - Error states
- Yellow: `#f59e0b` - Warning states
- Purple: `#a78bfa` - Accent color

### Mobile Responsiveness

- Sidebar hidden on mobile, accessible via hamburger menu
- Editors stack vertically on small screens (editor top, preview bottom)
- Touch-friendly button sizes and spacing
- Responsive grid layouts using Tailwind's `lg:` breakpoints

## Implementation Status

### ✅ Completed
- [x] Sidebar navigation with routing
- [x] Tasks tab (existing Kanban board)
- [x] Soul tab with markdown editing + preview
- [x] Agents tab with markdown editing + preview
- [x] File save API with Supabase tracking
- [x] Mobile responsive design
- [x] Database migration for file_changes

### 🚧 In Progress
- [ ] Memory tab (browse memory files, search, daily logs)
- [ ] Skills tab (list skills with status indicators)
- [ ] Config tab (display/edit OpenClaw config)

## Next Steps

### 1. Memory Tab
**Requirements:**
- List all files in `~/clawd/memory/`
- Display daily logs (YYYY-MM-DD.md format)
- Search integration using memory_search skill
- File browser with preview
- Filter by date, tags, people

**API Needed:**
- `GET /api/memory/list` - List all memory files
- `GET /api/memory/read?path=...` - Read specific file
- `POST /api/memory/search` - Search using memory_search

### 2. Skills Tab
**Requirements:**
- Query OpenClaw for installed skills
- Display status indicators:
  - 🟢 Green: Active and working
  - 🔴 Red: Installed but not working
  - ⚪ Gray: Available but not installed
- Show skill metadata (name, description, version)
- Quick actions (enable/disable/configure)

**API Needed:**
- `GET /api/skills/list` - Get all skills with status
- `POST /api/skills/status` - Check specific skill status
- `POST /api/skills/toggle` - Enable/disable skill

### 3. Config Tab
**Requirements:**
- Read OpenClaw config file
- Display in clean, readable format (YAML/JSON viewer)
- Edit capability with validation
- Save changes back to config file
- Restart notification/trigger

**API Needed:**
- `GET /api/config` - Read current config
- `POST /api/config/save` - Save config changes
- `POST /api/config/validate` - Validate before saving

## File Structure

```
stoa/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx             # Tasks (root)
│   │   ├── DashboardClient.tsx  # Task management logic
│   │   ├── soul/
│   │   │   ├── page.tsx
│   │   │   └── SoulEditor.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx
│   │   │   └── AgentsEditor.tsx
│   │   ├── memory/
│   │   │   └── page.tsx         # Placeholder
│   │   ├── skills/
│   │   │   └── page.tsx         # Placeholder
│   │   └── config/
│   │       └── page.tsx         # Placeholder
│   ├── api/
│   │   ├── files/
│   │   │   └── save/
│   │   │       └── route.ts
│   │   ├── tasks/
│   │   │   └── route.ts
│   │   └── comments/
│   │       └── route.ts
│   ├── login/
│   │   ├── page.tsx
│   │   └── LoginForm.tsx
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── KanbanBoard.tsx
│   ├── TaskCard.tsx
│   └── TaskModal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── types/
│       └── database.ts
├── supabase/
│   └── migrations/
│       └── 20260203_file_changes.sql
└── package.json
```

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "@hello-pangea/dnd": "^16.5.0",
    "lucide-react": "^0.344.0",
    "react-markdown": "^9.0.1"
  }
}
```

## Usage

### Development
```bash
npm run dev
# → http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

### Database Migration
Apply the migration manually in Supabase SQL editor:
```sql
-- Run contents of supabase/migrations/20260203_file_changes.sql
```

## Integration with Marcus

When files are edited via Stoa:
1. Changes saved to disk immediately
2. Entry created in `file_changes` table
3. Marcus can poll this table or receive real-time updates
4. Marcus can reload changed files on next session

**Example Query (for Marcus):**
```sql
SELECT * FROM file_changes 
WHERE changed_at > NOW() - INTERVAL '1 hour'
ORDER BY changed_at DESC;
```

## Design Principles

1. **Pure Black/White**: High contrast, minimal distraction
2. **Responsive First**: Mobile to desktop, always functional
3. **Real-time Sync**: Changes saved immediately, no "Save" button anxiety
4. **Markdown Native**: Edit in markdown, preview live
5. **File-based**: Everything syncs to actual files, not just database
6. **Transparent**: Changes tracked, auditable, reversible

## Performance Considerations

- Server-side rendering for initial load
- Client-side navigation for instant transitions
- Debounced save (avoid excessive writes)
- Lazy loading for memory files (pagination)
- Indexed database queries for fast lookups

## Security

- All routes protected by Supabase auth
- RLS policies on all tables
- File path validation to prevent directory traversal
- User-scoped change tracking
- No sensitive data in client bundles

---

**Status:** Phase 1 complete (Navigation, Soul, Agents)  
**Next:** Phase 2 (Memory, Skills, Config tabs)  
**Version:** 0.2.0  
**Last Updated:** February 3, 2026
