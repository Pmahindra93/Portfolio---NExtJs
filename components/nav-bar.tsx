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
        router.push('/blog/new')
        return
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'user:email',
        }
      })

      if (error) {
        console.error('GitHub auth error:', error)
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      if (!data.url) {
        console.error('No auth URL returned')
        toast({
          title: "Authentication Error",
          description: "Failed to start authentication process",
          variant: "destructive"
        })
        return
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Admin access error:', error)
      toast({
        title: "Error",
        description: "Failed to access admin features",
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
          : 'bg-black text-white',
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
            <Label htmlFor="style-toggle" className="hidden md:inline-block text-sm font-medium">
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
              "hidden md:inline-flex text-sm font-medium transition-all",
              is90sStyle
                ? "border-2 border-[#FFFF00] bg-[#000080] text-[#FFFF00] hover:bg-[#000080]/90"
                : "bg-white text-black border border-black hover:bg-white/90"
            )}
          >
            {isLoading ? "Loading..." : isAdmin ? "New Post" : "Admin"}
          </Button>
        </div>
      </div>
    </nav>
  )
}
