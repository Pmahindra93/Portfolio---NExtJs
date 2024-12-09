-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own record with admin check"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id AND
  (
    -- Allow setting admin = true only if email matches ADMIN_EMAIL
    (admin = true AND email = current_setting('app.admin_email', true)) OR
    -- Allow setting admin = false for any user
    (admin = false)
  )
);

CREATE POLICY "Users can update their own record with admin check"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  (
    -- Allow setting admin = true only if email matches ADMIN_EMAIL
    (admin = true AND email = current_setting('app.admin_email', true)) OR
    -- Allow setting admin = false for any user
    (admin = false)
  )
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND admin = true
  );
$$;
