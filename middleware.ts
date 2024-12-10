import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Allow access to auth-related routes
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return res
  }

  // Protected routes that require authentication
  const protectedPaths = ['/blog/new', '/admin']
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    if (!session) {
      // Redirect to sign in page
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/signin'
      redirectUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is admin for admin routes
    if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/blog/new',
    '/admin/:path*',
    '/auth/:path*'
  ]
}
