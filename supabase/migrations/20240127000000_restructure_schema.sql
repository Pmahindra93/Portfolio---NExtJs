-- First, remove any dependencies on the profiles table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS set_updated_at();

-- Drop the profiles table
DROP TABLE IF EXISTS profiles;

-- Add admin field to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS admin BOOLEAN DEFAULT false;

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

-- Create policies for posts
CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- Create a trigger to set updated_at on posts
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
