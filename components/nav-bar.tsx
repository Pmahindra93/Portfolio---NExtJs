'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/hooks/useTheme'
import { useAdmin } from '@/lib/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function NavBar() {
  const { is90sStyle, toggleStyle } = useTheme()
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()
  const { toast } = useToast()

  const handleAdminAccess = async () => {
    try {
      if (isAdmin) {
        router.push('/admin/posts/new')
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'user:email'
          }
        })

        if (error) {
          console.error('Auth error:', error)
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive"
          })
        } else if (!data) {
          console.error('No data returned from auth')
          toast({
            title: "Authentication Error",
            description: "No response from authentication service",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b h-16 flex items-center',
        is90sStyle
          ? 'bg-[#000080] text-[#FFFF00] border-[#000000] border-4'
          : 'bg-primary text-primary-foreground'
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link
          href="/"
          className={cn(
            is90sStyle
              ? 'text-4xl font-bold animate-pulse text-[#FFFF00]'
              : 'text-2xl font-semibold text-primary-foreground'
          )}
        >
          {is90sStyle ? "Welcome to Prateek's Cyber Space!" : "Prateek Mahindra"}
        </Link>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="style-toggle" className="text-sm font-medium">
              Website Style:
            </Label>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${is90sStyle ? 'font-bold' : ''}`}>90s</span>
              <Switch
                id="style-toggle"
                checked={!is90sStyle}
                onCheckedChange={toggleStyle}
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
