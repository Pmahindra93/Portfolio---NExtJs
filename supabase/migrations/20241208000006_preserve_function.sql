-- First, remove any dependencies on the profiles table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop the profiles table
DROP TABLE IF EXISTS profiles;

-- Add admin field to auth.users if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'admin'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Ensure posts table exists with proper structure and foreign key
CREATE TABLE IF NOT EXISTS posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    published boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_image text
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Public posts are viewable by everyone'
    ) THEN
        CREATE POLICY "Public posts are viewable by everyone"
            ON posts FOR SELECT
            USING (published = true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can create their own posts'
    ) THEN
        CREATE POLICY "Users can create their own posts"
            ON posts FOR INSERT
            WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can update their own posts'
    ) THEN
        CREATE POLICY "Users can update their own posts"
            ON posts FOR UPDATE
            USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'posts' 
        AND policyname = 'Users can delete their own posts'
    ) THEN
        CREATE POLICY "Users can delete their own posts"
            ON posts FOR DELETE
            USING (auth.uid() = author_id);
    END IF;
END $$;
