'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
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
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        }
      })

      if (error) throw error

      if (!data.url) {
        throw new Error('No redirect URL received')
      }

      // Redirect to the OAuth provider
      window.location.href = data.url
    } catch (error) {
      console.error('Sign in error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in with GitHub',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm space-y-4 p-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>
        <Button
          className="w-full"
          onClick={handleGithubSignIn}
          disabled={isLoading}
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
      </Card>
    </div>
  )
}
