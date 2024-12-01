import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAdmin(session?.user?.email === ADMIN_EMAIL)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { isAdmin, isLoading }
}
