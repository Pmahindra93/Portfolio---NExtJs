import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

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
            admin: isAdmin
          })
          .eq('id', session.user.id)

        if (updateError?.code === 'PGRST116') { // Record not found
          // If update fails because user doesn't exist, insert new user
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              admin: isAdmin
            })

          if (insertError) {
            console.error('Error inserting user:', insertError)
          }
        } else if (updateError) {
          console.error('Error updating user:', updateError)
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl))
    }

    return NextResponse.redirect(new URL('/', requestUrl))
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/', requestUrl))
  }
}
