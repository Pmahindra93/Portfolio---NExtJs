import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get admin status from auth.users
  const { data: userData } = await supabase
    .from('auth.users')
    .select('admin')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ 
    id: user.id,
    email: user.email,
    admin: userData?.admin ?? false
  })
}
