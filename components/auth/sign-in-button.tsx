"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Github, LogOut } from "lucide-react";

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignIn}
      disabled={isLoading}
      className="ml-auto"
    >
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          <Github className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </>
      )}
    </Button>
  );
}
