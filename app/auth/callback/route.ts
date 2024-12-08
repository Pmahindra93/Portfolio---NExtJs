import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      if (session?.user) {
        console.log('Session user:', {
          id: session.user.id,
          email: session.user.email,
          adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL
        })

        // First check if user exists
        const { data: existingUser, error: checkError } = await supabase
          .from('auth.users')
          .select('id, email, admin')
          .eq('id', session.user.id)
          .single()

        console.log('Existing user check:', { existingUser, error: checkError })

        // Try to create user directly in auth.users
        const { error: insertError } = await supabase
          .from('auth.users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            admin: session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating user:', insertError)
          throw insertError
        }

        // Verify user was created
        const { data: verifyUser, error: verifyError } = await supabase
          .from('auth.users')
          .select('id, email, admin')
          .eq('id', session.user.id)
          .single()

        console.log('Verify user:', { verifyUser, error: verifyError })
      }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/signin?error=Unexpected error during sign in', request.url)
    )
  }
}
