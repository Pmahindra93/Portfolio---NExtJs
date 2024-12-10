-- First, drop any triggers that depend on set_updated_at
DO $$ 
BEGIN
    -- Drop triggers that might be using set_updated_at
    DROP TRIGGER IF EXISTS set_updated_at ON posts;
    DROP TRIGGER IF EXISTS set_updated_at ON profiles;
    
    -- Now it's safe to drop and recreate the function
    DROP FUNCTION IF EXISTS set_updated_at();
END $$;
