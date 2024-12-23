import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (!code) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }

    if (!session?.user?.email) {
      throw new Error('No user email in session')
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

    console.log('Session user:', {
      id: session.user.id,
      email: session.user.email,
      adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      isAdmin
    })

    // First try to update if the user exists
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email: session.user.email,
        admin: isAdmin,
        last_sign_in: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (updateError?.code === 'PGRST116') { // Record not found
      // If update fails because user doesn't exist, insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          admin: isAdmin,
          last_sign_in: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error inserting user:', insertError)
      }
    } else if (updateError) {
      console.error('Error updating user:', updateError)
    }

    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/signin?error=Something went wrong', request.url)
    )
  }
}
