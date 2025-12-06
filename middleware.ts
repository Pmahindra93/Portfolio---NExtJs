import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: req,
  })

  // Create a Supabase client with the new cookie interface
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Allow access to auth-related routes
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return response
  }

  // Protected routes that require authentication
  const protectedPaths = ['/blog/new', '/admin']
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    // Use getUser() instead of getSession() to avoid session refresh issues
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user || error) {
      // Redirect to sign in page
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/signin'
      redirectUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is admin for admin routes
    if (req.nextUrl.pathname.startsWith('/admin') &&
        user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/blog/new',
    '/admin/:path*',
    '/auth/:path*'
  ]
}
