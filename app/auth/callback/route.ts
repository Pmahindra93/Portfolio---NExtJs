import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle cookie errors (e.g., in Server Components)
          }
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

    // Use upsert to handle both insert and update atomically
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: session.user.id,
        email: session.user.email,
        admin: isAdmin,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('Error upserting user:', upsertError)
    }

    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/signin?error=Something went wrong', request.url)
    )
  }
}
