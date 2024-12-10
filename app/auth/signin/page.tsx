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
  const error = searchParams.get('error')
  const next = searchParams.get('next') || '/'
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Show error toast if there's an error in the URL
    if (error) {
      toast({
        title: 'Authentication Error',
        description: decodeURIComponent(error),
        variant: 'destructive',
      })
    }
  }, [error, toast])

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true)
      console.log('Starting GitHub sign in...')

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        }
      })

      if (error) throw error

      console.log('Sign in successful, redirecting...')
    } catch (error) {
      console.error('Sign in error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in with GitHub',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Sign In</h1>
          <Button
            variant="outline"
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
