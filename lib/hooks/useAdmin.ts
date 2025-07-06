import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  console.error('NEXT_PUBLIC_ADMIN_EMAIL is not set');
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setIsAdmin(false);
          return;
        }

        if (!user) {
          console.log('No user found');
          setIsAdmin(false);
          return;
        }

        console.log('Current user email:', user?.email);
        console.log('Admin email:', ADMIN_EMAIL);
        
        const isUserAdmin = user?.email === ADMIN_EMAIL;
        console.log('Is admin?', isUserAdmin);
        
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      console.log('Session user email:', session?.user?.email);
      const isUserAdmin = session?.user?.email === ADMIN_EMAIL;
      console.log('Setting admin status to:', isUserAdmin);
      setIsAdmin(isUserAdmin);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading };
}
