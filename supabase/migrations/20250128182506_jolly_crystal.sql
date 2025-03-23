/*
  # Fix User Signup Flow

  1. Changes
    - Drop and recreate triggers in correct order
    - Ensure proper error handling for user creation
    - Add missing table dependencies
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper user isolation
*/

-- First, drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_stats ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_defaults ON auth.users;

-- Ensure tables exist with proper constraints
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  weekly_prompts boolean DEFAULT true,
  monthly_prompts boolean DEFAULT true,
  achievement_notifications boolean DEFAULT true,
  prompt_day integer DEFAULT 1,
  prompt_time time DEFAULT '09:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  total_memories integer DEFAULT 0,
  total_points integer DEFAULT 0,
  memory_streak integer DEFAULT 0,
  last_memory_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create a single function to handle all user defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification preferences
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user stats
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create single trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS on tables if not already enabled
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policies exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_preferences' 
    AND policyname = 'Users can manage their notification preferences'
  ) THEN
    CREATE POLICY "Users can manage their notification preferences"
      ON notification_preferences
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_stats' 
    AND policyname = 'Users can view their stats'
  ) THEN
    CREATE POLICY "Users can view their stats"
      ON user_stats
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;