import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Helper function to check if user is admin
async function isAdmin(supabase: SupabaseClient) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return false;
  }

  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    return false;
  }

  return data;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await isAdmin(supabase);
    if (!admin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get request body
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Insert post
    type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

    const postData: PostInsert = {
      title,
      content,
      author_id: session.user.id,
      published: true,
    };

    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
