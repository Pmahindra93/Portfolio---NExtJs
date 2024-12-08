import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

// Create a Supabase client with the service role
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  try {
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

      if (session?.user?.email) {
        console.log('Session user:', {
          id: session.user.id,
          email: session.user.email,
          adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL
        })

        // Upsert user record in public.users table using service role
        const { error: upsertError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            admin: session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
          } satisfies Database['public']['Tables']['users']['Insert'])

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
