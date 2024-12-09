import { NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        session: null
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      email: session.user.email,
      id: session.user.id,
      adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      isAdmin: session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
