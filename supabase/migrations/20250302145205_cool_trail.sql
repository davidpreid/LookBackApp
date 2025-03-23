-- Drop existing trigger and function to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_error BOOLEAN := false;
  pref_error BOOLEAN := false;
  stats_error BOOLEAN := false;
BEGIN
  -- Create profile with error handling
  BEGIN
    INSERT INTO public.profiles (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN others THEN
    profile_error := true;
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
  END;

  -- Create notification preferences with error handling
  BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN others THEN
    pref_error := true;
    RAISE WARNING 'Error creating notification preferences for user %: %', new.id, SQLERRM;
  END;

  -- Create user stats with error handling
  BEGIN
    INSERT INTO user_stats (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN others THEN
    stats_error := true;
    RAISE WARNING 'Error creating user stats for user %: %', new.id, SQLERRM;
  END;

  -- Log overall status
  IF profile_error OR pref_error OR stats_error THEN
    RAISE WARNING 'Some errors occurred during user setup: Profile: %, Preferences: %, Stats: %',
      profile_error, pref_error, stats_error;
  END IF;

  RETURN new;
END;
$$;

-- Create trigger with AFTER timing to ensure user exists first
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure all existing users have required records
DO $$
DECLARE
  missing_profiles INTEGER;
  missing_prefs INTEGER;
  missing_stats INTEGER;
BEGIN
  -- Check and create missing profiles
  WITH missing_users AS (
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT id FROM profiles)
  )
  INSERT INTO profiles (id)
  SELECT id FROM missing_users
  ON CONFLICT (id) DO NOTHING
  RETURNING 1
  INTO missing_profiles;

  -- Check and create missing preferences
  WITH missing_users AS (
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM notification_preferences)
  )
  INSERT INTO notification_preferences (user_id)
  SELECT id FROM missing_users
  ON CONFLICT (user_id) DO NOTHING
  RETURNING 1
  INTO missing_prefs;

  -- Check and create missing stats
  WITH missing_users AS (
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM user_stats)
  )
  INSERT INTO user_stats (user_id)
  SELECT id FROM missing_users
  ON CONFLICT (user_id) DO NOTHING
  RETURNING 1
  INTO missing_stats;

  -- Log results
  RAISE NOTICE 'Created missing records - Profiles: %, Preferences: %, Stats: %',
    COALESCE(missing_profiles, 0),
    COALESCE(missing_prefs, 0),
    COALESCE(missing_stats, 0);
END;
$$;