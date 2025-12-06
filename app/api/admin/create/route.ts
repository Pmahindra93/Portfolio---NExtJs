import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkIsAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }

  return !!data;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only existing admins can create new admins
    const isAdmin = await checkIsAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can create other admins" },
        { status: 403 }
      );
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user to admin status
    const { error: updateError } = await supabase
      .from("users")
      .update({ admin: true })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User promoted to admin successfully",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
