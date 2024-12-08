import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

// Helper function to check if user is admin
async function isAdmin(supabase: ReturnType<typeof createRouteHandlerClient<Database>>) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    return false;
  }

  // Check admin status in public.users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('admin')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    return false;
  }

  return user.admin;
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('No session found:', { sessionError });
      return new NextResponse("Unauthorized - No session", { status: 401 });
    }

    console.log('Current session:', {
      userId: session.user.id,
      userEmail: session.user.email,
      adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL
    });

    // Upsert user record
    if (session.user.email) {
      console.log('Upserting user record...');
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          admin: session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
        } satisfies Database['public']['Tables']['users']['Insert'],
        { onConflict: 'id' });

      if (upsertError) {
        console.error('Error upserting user:', upsertError);
        return new NextResponse("Error creating/updating user", { status: 500 });
      }
    }

    // Check admin status
    const adminStatus = await isAdmin(supabase);
    if (!adminStatus) {
      console.error('Unauthorized attempt to create post');
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          author_id: session.user.id,
          published: true
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting post:', insertError);
      return new NextResponse("Error creating post", { status: 500 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in POST /api/blog:', error);
    return new NextResponse(
      "Internal Server Error",
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
      console.error('Error fetching posts:', error);
      return new NextResponse("Error fetching posts", { status: 500 });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in GET /api/blog:', error);
    return new NextResponse(
      "Internal Server Error",
      { status: 500 }
    );
  }
}
