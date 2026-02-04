export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'backlog' | 'todo' | 'in-progress' | 'done'
          priority: 'high' | 'medium' | 'low'
          category: string | null
          due_date: string | null
          creator: 'jeremiah' | 'marcus'
          is_recurring: boolean
          recurrence_frequency: string | null
          memory_links: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: 'backlog' | 'todo' | 'in-progress' | 'done'
          priority: 'high' | 'medium' | 'low'
          category?: string | null
          due_date?: string | null
          creator: 'jeremiah' | 'marcus'
          is_recurring?: boolean
          recurrence_frequency?: string | null
          memory_links?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'backlog' | 'todo' | 'in-progress' | 'done'
          priority?: 'high' | 'medium' | 'low'
          category?: string | null
          due_date?: string | null
          creator?: 'jeremiah' | 'marcus'
          is_recurring?: boolean
          recurrence_frequency?: string | null
          memory_links?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      task_history: {
        Row: {
          id: string
          task_id: string
          completed_at: string
          notes: string | null
          completed_by: 'jeremiah' | 'marcus' | null
        }
        Insert: {
          id?: string
          task_id: string
          completed_at?: string
          notes?: string | null
          completed_by?: 'jeremiah' | 'marcus' | null
        }
        Update: {
          id?: string
          task_id?: string
          completed_at?: string
          notes?: string | null
          completed_by?: 'jeremiah' | 'marcus' | null
        }
      }
      comments: {
        Row: {
          id: string
          task_id: string
          author: 'jeremiah' | 'marcus'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          author: 'jeremiah' | 'marcus'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          author?: 'jeremiah' | 'marcus'
          content?: string
          created_at?: string
        }
      }
      config_files: {
        Row: {
          id: string
          file_path: string
          content: string
          updated_at: string
          updated_by: 'jeremiah' | 'marcus' | null
        }
        Insert: {
          id?: string
          file_path: string
          content: string
          updated_at?: string
          updated_by?: 'jeremiah' | 'marcus' | null
        }
        Update: {
          id?: string
          file_path?: string
          content?: string
          updated_at?: string
          updated_by?: 'jeremiah' | 'marcus' | null
        }
      }
    }
  }
}

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Comment = Database['public']['Tables']['comments']['Row']
export type TaskHistory = Database['public']['Tables']['task_history']['Row']
export type ConfigFile = Database['public']['Tables']['config_files']['Row']
