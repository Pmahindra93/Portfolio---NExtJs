-- Create public.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        AND policyname = 'Users can view their own data'
    ) THEN
        CREATE POLICY "Users can view their own data" 
            ON public.users FOR SELECT 
            USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        AND policyname = 'Users can update their own data'
    ) THEN
        CREATE POLICY "Users can update their own data" 
            ON public.users FOR UPDATE 
            USING (auth.uid() = id);
    END IF;
END $$;

-- Create the stored procedure for user creation if it doesn't exist
CREATE OR REPLACE PROCEDURE create_user_if_not_exists(
    user_id uuid,
    user_email text,
    is_admin boolean DEFAULT false
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (id, email, admin)
    VALUES (user_id, user_email, is_admin)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        admin = EXCLUDED.admin,
        updated_at = now();
END;
$$;
