import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Skip auth check for callback route
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if we're on an admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('auth.users')
      .select('admin')
      .eq('id', session.user.id)
      .single()

    if (!userData?.admin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/auth/callback']
}
