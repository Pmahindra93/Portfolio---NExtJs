import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, UserRole } from '@/types/user'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: roleData?.role || 'user'
          })

          setIsAdmin(roleData?.role === 'admin')
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Check initial session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: roleData?.role || 'user'
        })

        setIsAdmin(roleData?.role === 'admin')
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return {
    user,
    isLoading,
    isAdmin,
    signOut
  }
}
