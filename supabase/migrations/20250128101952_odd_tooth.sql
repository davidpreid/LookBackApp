/*
  # Create User Default Records

  1. Changes
    - Add function to create default records for existing users
    - Create default records for notification preferences and user stats
    - Add trigger for new user signups

  2. Security
    - Functions run with SECURITY DEFINER to ensure proper access
*/

-- Function to ensure default records exist for a user
CREATE OR REPLACE FUNCTION ensure_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification preferences if they don't exist
  INSERT INTO notification_preferences (user_id, weekly_prompts, monthly_prompts, achievement_notifications, prompt_day, prompt_time)
  VALUES (
    NEW.id,
    true,
    true,
    true,
    1,
    '09:00:00'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user stats if they don't exist
  INSERT INTO user_stats (user_id, total_memories, total_points, memory_streak)
  VALUES (
    NEW.id,
    0,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default records for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    INSERT INTO notification_preferences (user_id, weekly_prompts, monthly_prompts, achievement_notifications, prompt_day, prompt_time)
    VALUES (
      user_record.id,
      true,
      true,
      true,
      1,
      '09:00:00'
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_stats (user_id, total_memories, total_points, memory_streak)
    VALUES (
      user_record.id,
      0,
      0,
      0
    )
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created_defaults ON auth.users;

CREATE TRIGGER on_auth_user_created_defaults
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE ensure_user_defaults();