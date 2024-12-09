import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// Helper function to check if user is admin
async function isAdmin(supabase: ReturnType<typeof createRouteHandlerClient<Database>>) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    console.error('No session in isAdmin check:', { sessionError });
    return false;
  }

  console.log('Checking admin status for user:', {
    userId: session.user.id,
    userEmail: session.user.email,
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL
  });

  const { data, error } = await supabase
    .rpc('is_admin');

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return data;
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const admin = await isAdmin(supabase);
    if (!admin) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Insert post
    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        author_id: session.user.id,
        published: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting post:', insertError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in POST /api/blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in GET /api/blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
