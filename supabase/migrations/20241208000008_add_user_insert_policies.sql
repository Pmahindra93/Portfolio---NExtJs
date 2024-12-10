-- Add INSERT policy for users table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users only" 
        ON public.users 
        FOR INSERT 
        WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        AND policyname = 'Allow service role full access'
    ) THEN
        CREATE POLICY "Allow service role full access" 
        ON public.users 
        USING (auth.jwt() IS NULL);
    END IF;
END $$;
