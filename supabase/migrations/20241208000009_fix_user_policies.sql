-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create new policies
CREATE POLICY "Enable insert for service role"
ON public.users
FOR INSERT
WITH CHECK (
  (SELECT current_setting('role') = 'service_role')
);

CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (
  auth.uid() = id OR
  (SELECT current_setting('role') = 'service_role')
);

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (
  auth.uid() = id OR
  (SELECT current_setting('role') = 'service_role')
);
