import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'

    console.log('Auth callback received:', {
      code: code ? 'present' : 'missing',
      error,
      error_description,
      url: requestUrl.toString()
    })

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

    // Update the user's admin status using RPC
    const { data: updateResult, error: updateError } = await supabase.rpc('set_user_admin_status', {
      user_id: session.user.id,
      is_admin: false // default to false for new users
    })

    if (updateError) {
      console.error('Error updating user admin status:', updateError)
      return NextResponse.redirect(`${requestUrl.origin}?error=Failed to update user status`)
    }

    // Get the updated user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('admin')
      .eq('id', session.user.id)
      .single()

    // If user is admin, redirect to new post page
    if (userData?.admin) {
      console.log('Admin login successful:', session.user.email)
      return NextResponse.redirect(`${requestUrl.origin}/admin/posts/new`)
    }

    // For non-admin users, redirect to the requested page or home
    console.log('Non-admin login:', session.user?.email)
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)

  } catch (error) {
    console.error('Unexpected error in callback:', error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}?error=An unexpected error occurred`)
  }
}
