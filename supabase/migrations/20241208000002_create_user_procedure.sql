-- Create a function to create a user if they don't exist
CREATE OR REPLACE FUNCTION create_user_if_not_exists(
  user_id uuid,
  user_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the user if they don't exist
  INSERT INTO auth.users (id, email, admin)
  VALUES (
    user_id,
    user_email,
    user_email = current_setting('NEXT_PUBLIC_ADMIN_EMAIL', true)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      admin = EXCLUDED.admin;
END;
$$;
