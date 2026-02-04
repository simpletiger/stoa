# Stoa

**Shared Nervous System for Jeremiah and Marcus**

A meditative task management dashboard built with Next.js 14, Supabase, and Tailwind CSS. Named after the Stoic gathering place, Stoa is where thought becomes action.

## 🎯 Purpose

Stoa serves as the interface between Jeremiah (human) and Marcus (AI assistant), providing:

- **Task Visualization** - Kanban board with drag-and-drop
- **Real-time Sync** - Changes appear instantly
- **Shared Context** - Both users see the same state
- **Asynchronous Collaboration** - Work together without direct communication

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Supabase (Postgres + Realtime)
- **Auth:** GitHub OAuth
- **Styling:** Tailwind CSS (Dracula-inspired dark theme)
- **Deployment:** Vercel

## 📋 Features

### Phase 1 (Current)
- ✅ GitHub OAuth authentication
- ✅ Kanban board with 4 columns (Backlog, To Do, In Progress, Done)
- ✅ Drag-and-drop task management
- ✅ Real-time updates via WebSocket
- ✅ Task CRUD operations
- ✅ Priority levels (high, medium, low)
- ✅ Category tagging
- ✅ Due dates
- ✅ Mobile responsive design
- ✅ API routes for programmatic access

### Phase 2 (Planned)
- [ ] Comment threads on tasks
- [ ] Recurring tasks with history
- [ ] Config file editor (SOUL.md, AGENTS.md, etc.)
- [ ] Search and filtering
- [ ] Task templates
- [ ] Analytics dashboard

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Supabase account
- A GitHub account (for OAuth)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/simpletiger/stoa.git
cd stoa
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

4. **Set up the database:**

Go to your Supabase project → SQL Editor and run the schema:
```bash
cat supabase/schema.sql
```

5. **Configure GitHub OAuth:**

- Go to GitHub Settings → Developer settings → OAuth Apps
- Create a new OAuth App
- Set callback URL to: `https://[project-ref].supabase.co/auth/v1/callback`
- Copy Client ID and Secret
- In Supabase: Authentication → Providers → GitHub
- Enable and paste credentials

6. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📡 API Usage (Marcus Integration)

### Using Supabase Client (Recommended)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-service-role-key'  // Use service key for full access
)

// Create a task
const { data, error } = await supabase
  .from('tasks')
  .insert([{
    title: 'Task from Marcus',
    description: 'Details here',
    status: 'todo',
    priority: 'high',
    category: 'dev',
    creator: 'marcus'
  }])
  .select()

// Get all tasks
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .order('created_at', { ascending: false })

// Update a task
await supabase
  .from('tasks')
  .update({ status: 'in-progress' })
  .eq('id', taskId)

// Add a comment
await supabase
  .from('comments')
  .insert([{
    task_id: taskId,
    author: 'marcus',
    content: 'Working on this now'
  }])
```

### Using REST API

```bash
# Get all tasks
curl https://stoa.vercel.app/api/tasks

# Create a task
curl -X POST https://stoa.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New task",
    "status": "todo",
    "priority": "high",
    "creator": "marcus"
  }'

# Update a task
curl -X PATCH https://stoa.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "task-uuid",
    "status": "done"
  }'

# Delete a task
curl -X DELETE "https://stoa.vercel.app/api/tasks?id=task-uuid"
```

### Real-time Subscriptions

```typescript
// Listen for task changes
const channel = supabase
  .channel('tasks-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => {
      console.log('Task changed:', payload)
      // React to INSERT, UPDATE, or DELETE
    }
  )
  .subscribe()
```

## 🗄️ Database Schema

### tasks
```sql
id UUID PRIMARY KEY
title TEXT NOT NULL
description TEXT
status TEXT -- 'backlog', 'todo', 'in-progress', 'done'
priority TEXT -- 'high', 'medium', 'low'
category TEXT
due_date TIMESTAMP
creator TEXT -- 'jeremiah' or 'marcus'
is_recurring BOOLEAN
recurrence_frequency TEXT
memory_links TEXT[]
created_at TIMESTAMP
updated_at TIMESTAMP
```

### comments
```sql
id UUID PRIMARY KEY
task_id UUID REFERENCES tasks(id)
author TEXT -- 'jeremiah' or 'marcus'
content TEXT NOT NULL
created_at TIMESTAMP
```

### task_history
```sql
id UUID PRIMARY KEY
task_id UUID REFERENCES tasks(id)
completed_at TIMESTAMP
notes TEXT
completed_by TEXT
```

## 🎨 Design Philosophy

- **Mac Aesthetic** - Clean, minimal, intentional
- **Dracula Theme** - Dark background (#282a36), purple accents (#bd93f9)
- **Meditative** - Calm colors, smooth animations, no clutter
- **Mobile-first** - Touch-friendly, responsive at all sizes

## 🧠 Marcus Integration

Marcus should check Stoa periodically (every 30 minutes via heartbeat) to:

1. Check for new high-priority tasks
2. Update task statuses as work progresses
3. Add comments with progress updates
4. Create tasks from natural language instructions

Example heartbeat integration:

```typescript
// In Marcus's heartbeat
const { data: urgentTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('priority', 'high')
  .eq('status', 'todo')
  .order('created_at', { ascending: false })

if (urgentTasks.length > 0) {
  console.log(`${urgentTasks.length} urgent tasks waiting`)
  // Act on them
}
```

## 📁 Project Structure

```
stoa/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Auth callback
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Dashboard (server)
│   ├── DashboardClient.tsx  # Dashboard (client)
│   └── globals.css       # Global styles
├── components/
│   ├── Header.tsx        # Top navigation
│   ├── KanbanBoard.tsx   # Drag-and-drop board
│   ├── TaskCard.tsx      # Task display
│   └── TaskModal.tsx     # Create/edit form
├── lib/
│   ├── supabase/         # Supabase clients
│   └── types/            # TypeScript types
├── supabase/
│   └── schema.sql        # Database schema
└── [config files]        # Next.js, Tailwind, etc.
```

## 🚢 Deployment

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

Quick version:
1. Push to GitHub
2. Create Supabase project and run schema
3. Configure GitHub OAuth
4. Deploy to Vercel
5. Add environment variables

## 📝 License

Private project for SimpleTiger LLC

## 👥 Authors

- **Jeremiah** - Human collaborator
- **Marcus** - AI assistant

---

*"The happiness of your life depends upon the quality of your thoughts."* — Marcus Aurelius
