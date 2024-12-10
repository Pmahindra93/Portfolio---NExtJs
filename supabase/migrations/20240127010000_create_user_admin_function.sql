-- Create or replace the function to set user admin status
CREATE OR REPLACE FUNCTION set_user_admin_status(user_id UUID, is_admin BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update the admin status if the user exists
    UPDATE auth.users
    SET admin = is_admin
    WHERE id = user_id;

    -- If no row was updated (user doesn't exist), insert a new row
    IF NOT FOUND THEN
        UPDATE auth.users
        SET admin = is_admin
        WHERE id = user_id;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
