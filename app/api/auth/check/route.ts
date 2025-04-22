import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session error:', error)
      return NextResponse.json({
        isAuthenticated: false,
        isAdmin: false,
        error: 'Session error'
      }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({
        isAuthenticated: false,
        isAdmin: false
      })
    }

    // Check admin status using the user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const isAdmin = roleData?.role === 'admin'

    return NextResponse.json({
      isAuthenticated: true,
      isAdmin,
      email: session.user?.email
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
