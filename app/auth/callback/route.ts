import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession()

    // Check if the user is an admin
    if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.redirect(`${requestUrl.origin}/admin/posts/new`)
    }
  }

  // Redirect to home page if not admin or if there's an error
  return NextResponse.redirect(`${requestUrl.origin}`)
}
