import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          setIsAdmin(false);
          return;
        }

        if (!user) {
          setIsAdmin(false);
          return;
        }

        const isUserAdmin = user?.email === ADMIN_EMAIL;

        setIsAdmin(isUserAdmin);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isUserAdmin = session?.user?.email === ADMIN_EMAIL;
      setIsAdmin(isUserAdmin);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading };
}
