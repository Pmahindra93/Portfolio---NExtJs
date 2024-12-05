'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/hooks/useTheme'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function NavBar({ className }: { className?: string }) {
  const { is90sStyle, toggle90sStyle } = useTheme()
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()
  const { toast } = useToast()

  const handleAdminAccess = async () => {
    try {
      if (isAdmin) {
        router.push('/admin/posts/new')
        return
      }

      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('Starting GitHub auth flow...', { redirectUrl })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          scopes: 'user:email',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        console.error('GitHub auth error:', error)
        toast({
          title: "Authentication Error",
          description: `Failed to sign in with GitHub: ${error.message}`,
          variant: "destructive"
        })
        return
      }

      if (!data) {
        console.error('No data returned from GitHub auth')
        toast({
          title: "Authentication Error",
          description: "No response from GitHub authentication",
          variant: "destructive"
        })
        return
      }

      console.log('GitHub auth successful, data:', data)
      toast({
        title: "Authentication Started",
        description: "Redirecting to GitHub...",
        duration: 2000
      })

    } catch (error) {
      console.error('Unexpected error during GitHub auth:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during authentication",
        variant: "destructive"
      })
    }
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b h-16 flex items-center w-screen',
        is90sStyle
          ? 'bg-[#000080] text-[#FFFF00] border-[#000000] border-4 border-x-0 border-t-0'
          : 'bg-primary text-primary-foreground',
        className
      )}
    >
      <div className="w-full px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className={cn(
            "font-bold inline-block",
            is90sStyle
              ? "text-[#FFFF00] font-['Comic_Sans_MS',_cursive] animate-pulse text-2xl"
              : ""
          )}>
            <span className="hidden md:inline">
              {is90sStyle ? "Welcome to Prateek's Cyber Space!" : "Prateek Mahindra"}
            </span>
            <span className="md:hidden">
              {is90sStyle ? "Prateek's Space" : "Prateek M."}
            </span>
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="style-toggle" className="text-sm font-medium">
              Website Style:
            </Label>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${is90sStyle ? 'font-bold' : ''}`}>90s</span>
              <Switch
                id="style-toggle"
                checked={!is90sStyle}
                onCheckedChange={toggle90sStyle}
                aria-label="Toggle between 90s and modern style"
              />
              <span className={`text-sm ${!is90sStyle ? 'font-bold' : ''}`}>Modern</span>
            </div>
          </div>
          <Button
            onClick={handleAdminAccess}
            variant={is90sStyle ? "secondary" : "default"}
            className={cn(
              "text-sm font-medium transition-all",
              is90sStyle
                ? "border-2 border-[#FFFF00] bg-[#000080] text-[#FFFF00] hover:bg-[#000080]/90"
                : "bg-black text-white border border-white/20 hover:bg-black/80 hover:border-white/40"
            )}
          >
            {isLoading ? "Loading..." : isAdmin ? "New Post" : "Admin Sign In"}
          </Button>
        </div>
      </div>
    </nav>
  )
}
