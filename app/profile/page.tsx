'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch('/api/user')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    }
    fetchUser()
  }, [])

  const copyToClipboard = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const makeAdmin = async () => {
    if (!user?.id) return
    
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (!error) {
      alert('Successfully set as admin!')
    } else {
      alert('Error setting admin role: ' + error.message)
    }
  }

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p>Please sign in first</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="p-6 w-full max-w-md space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Your Profile</h2>
          <p className="text-muted-foreground">Email: {user.email}</p>
          <p className="text-muted-foreground break-all">
            User ID: {user.id}
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={copyToClipboard}
            className="w-full"
            variant="outline"
          >
            {copied ? 'Copied!' : 'Copy User ID'}
          </Button>

          <Button 
            onClick={makeAdmin}
            className="w-full"
          >
            Make me Admin
          </Button>
        </div>
      </Card>
    </div>
  )
}
