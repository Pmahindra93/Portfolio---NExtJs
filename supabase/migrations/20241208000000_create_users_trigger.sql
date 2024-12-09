-- Function to handle new user signup and set admin status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Get admin email from environment variable
  IF NEW.email = current_setting('NEXT_PUBLIC_ADMIN_EMAIL', true) THEN
    NEW.admin := true;
  ELSE
    NEW.admin := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function before a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
