-- Create a public users table that mirrors auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin users can view all data"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND admin = true
    )
  );

-- Update the posts foreign key to reference public.users instead
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create a trigger to set updated_at
CREATE OR REPLACE FUNCTION set_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_users_updated_at();
