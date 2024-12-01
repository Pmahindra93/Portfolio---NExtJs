'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Github } from 'lucide-react'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const redirectedFrom = searchParams.get('redirectedFrom')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(redirectedFrom || '/')
      }
    }
    checkUser()
  }, [router, redirectedFrom, supabase.auth])

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectedFrom || '/'}`,
        },
      })

      if (error) throw error
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in with GitHub',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" />
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
