"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if user is logged in
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/auth/signin?redirectedFrom=/admin");
          return;
        }

        // Check if user is admin
        const { data: userData, error } = await supabase
          .from("users")
          .select("admin")
          .eq("id", session.user.id)
          .single<{ admin: boolean }>();

        if (error) {
          console.error("Error checking admin status:", error);
          router.push("/");
          return;
        }

        if (!userData || !userData.admin) {
          router.push("/");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };

    checkAdminStatus();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
