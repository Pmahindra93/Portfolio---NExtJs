import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
      
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

        // Upsert user record in public.users table
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            admin: session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
          })

        if (upsertError) {
          console.error('Error upserting user:', upsertError)
        }
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin + next)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      requestUrl.origin + '/auth/auth-code-error'
    )
  }
}
