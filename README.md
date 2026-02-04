# Stoa Dashboard

> **Marcus's command center.** Task management, file editing, memory browsing, and system control in one place.

## 🎯 What Is This?

Stoa is a Next.js dashboard that gives Marcus (the AI agent) and Jeremiah direct access to:

1. **Tasks** - Kanban board for shared task management
2. **Soul** - Edit SOUL.md (Marcus's core identity)
3. **Agents** - Edit AGENTS.md (operational procedures)
4. **Memory** - Browse memory files and daily logs *(Phase 2)*
5. **Skills** - Monitor OpenClaw skills status *(Phase 2)*
6. **Config** - View/edit OpenClaw configuration *(Phase 2)*

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

**First time setup:**
1. Apply database migration (see `MIGRATION_GUIDE.md`)
2. Login with Supabase credentials
3. Start editing!

## 📸 Features

### ✅ Phase 1 (Complete)

- **Sidebar Navigation** - Desktop sidebar, mobile hamburger menu
- **Soul Editor** - Edit `~/clawd/SOUL.md` with live markdown preview
- **Agents Editor** - Edit `~/clawd/AGENTS.md` with live markdown preview
- **File Tracking** - Changes logged to Supabase for Marcus to monitor
- **Real-time Preview** - See markdown rendering as you type
- **Mobile Responsive** - Works on phones, tablets, and desktops

### 🚧 Phase 2 (In Progress)

- **Memory Browser** - Navigate and search `~/clawd/memory/` files
- **Skills Dashboard** - View OpenClaw skill status with indicators
- **Config Editor** - Edit OpenClaw configuration with validation

## 🎨 Design

- **Pure Black/White** theme (#000000 / #ffffff)
- **Minimal UI** with subtle grays for accents
- **Fast** - Server-side rendering + client-side navigation
- **Clean** - No clutter, no distractions

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get up and running fast
- **[DASHBOARD.md](DASHBOARD.md)** - Full technical documentation
- **[PROGRESS.md](PROGRESS.md)** - Detailed progress report
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Database setup
- **[PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)** - What's done

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS (black/white theme)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Markdown:** react-markdown
- **Icons:** lucide-react

## 🔗 Integration

### For Marcus (AI Agent)

**Detect file changes:**
```sql
SELECT * FROM file_changes 
WHERE changed_at > LAST_CHECK_TIME
ORDER BY changed_at DESC;
```

**Reload files when changed:**
- Soul: `~/clawd/SOUL.md`
- Agents: `~/clawd/AGENTS.md`

**Real-time option:**
Set up Supabase webhook to trigger on file_changes INSERT.

See `QUICKSTART.md` for integration code examples.

## 📂 Structure

```
stoa/
├── app/(dashboard)/       # Main dashboard routes
│   ├── layout.tsx         # Sidebar + Header
│   ├── page.tsx           # Tasks (Kanban)
│   ├── soul/              # Soul editor
│   ├── agents/            # Agents editor
│   ├── memory/            # Memory browser (Phase 2)
│   ├── skills/            # Skills dashboard (Phase 2)
│   └── config/            # Config editor (Phase 2)
├── components/            # React components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── ...
├── app/api/               # API routes
│   └── files/save/        # File save endpoint
└── supabase/
    └── migrations/        # Database migrations
```

## 🧪 Testing

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Lint
npm run lint
```

## 🚦 Status

- ✅ **Phase 1:** Complete (Navigation, Soul, Agents)
- 🚧 **Phase 2:** In progress (Memory, Skills, Config)
- 📅 **Started:** February 3, 2026
- ⏱️ **Time Spent:** ~60 minutes (Phase 1)

## 🤝 Contributing

This is a private tool for Marcus and Jeremiah. Not open source.

## 📝 License

Private. All rights reserved.

## 🎯 Roadmap

### Immediate (Phase 2)
- [ ] Memory browser with search
- [ ] Skills dashboard with status
- [ ] Config editor with validation

### Future
- [ ] Real-time collaboration (multiple users)
- [ ] Voice control integration
- [ ] Mobile app (React Native)
- [ ] Plugins system
- [ ] Backup/restore functionality

## 📞 Support

Check the documentation files:
1. Start with `QUICKSTART.md`
2. See `DASHBOARD.md` for technical details
3. Check `PROGRESS.md` for current status

---

**Version:** 0.2.0  
**Phase:** 1 Complete, 2 In Progress  
**Last Updated:** February 3, 2026 10:01 PM EST
