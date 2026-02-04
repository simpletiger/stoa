import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function TasksPage() {
  const supabase = await createClient()

  // Fetch initial tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  return <DashboardClient initialTasks={tasks || []} />
}
