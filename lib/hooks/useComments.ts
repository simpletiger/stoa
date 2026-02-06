import { useState, useEffect } from 'react'
import { Comment } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

export function useComments(taskId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch comments
  useEffect(() => {
    if (!taskId) {
      setComments([])
      setLoading(false)
      return
    }

    const fetchComments = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/comments?taskId=${taskId}`)
        if (!response.ok) throw new Error('Failed to fetch comments')
        const data = await response.json()
        setComments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchComments()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comments:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          setComments((current) => [...current, payload.new as Comment])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          setComments((current) =>
            current.filter((comment) => comment.id !== payload.old.id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId, supabase])

  const addComment = async (content: string, author: 'jeremiah' | 'marcus') => {
    if (!taskId) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          author,
          content,
        }),
      })

      if (!response.ok) throw new Error('Failed to add comment')
      // Real-time subscription will handle adding to state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
      throw err
    }
  }

  return {
    comments,
    loading,
    error,
    addComment,
    commentCount: comments.length,
  }
}
