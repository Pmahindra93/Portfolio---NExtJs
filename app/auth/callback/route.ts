import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description)
      return NextResponse.redirect(`${requestUrl.origin}?error=${encodeURIComponent(error_description || error)}`)
    }

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${requestUrl.origin}?error=No authorization code provided`)
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.redirect(`${requestUrl.origin}?error=${encodeURIComponent(sessionError.message)}`)
    }

    // Get the user's session
    const { data: { session }, error: getSessionError } = await supabase.auth.getSession()

    if (getSessionError) {
      console.error('Get session error:', getSessionError)
      return NextResponse.redirect(`${requestUrl.origin}?error=${encodeURIComponent(getSessionError.message)}`)
    }

    if (!session) {
      console.error('No session after successful code exchange')
      return NextResponse.redirect(`${requestUrl.origin}?error=Failed to create session`)
    }

    // Check if the user is an admin
    if (session.user?.email === process.env.ADMIN_EMAIL) {
      console.log('Admin login successful:', session.user.email)
      return NextResponse.redirect(`${requestUrl.origin}/admin/posts/new`)
    }

    console.log('Non-admin login:', session.user?.email)
    return NextResponse.redirect(requestUrl.origin)

  } catch (error) {
    console.error('Unexpected error in callback:', error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}?error=An unexpected error occurred`)
  }
}
