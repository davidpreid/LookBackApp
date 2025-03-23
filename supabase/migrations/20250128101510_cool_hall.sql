/*
  # Add Engagement and Gamification Features

  1. New Tables
    - achievements: Stores achievement definitions and criteria
    - user_achievements: Tracks user progress and earned achievements
    - notification_preferences: Stores user notification settings
    - user_stats: Tracks user activity metrics

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create achievements table
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  criteria jsonb NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  achievement_id uuid REFERENCES achievements NOT NULL,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  weekly_prompts boolean DEFAULT true,
  monthly_prompts boolean DEFAULT true,
  achievement_notifications boolean DEFAULT true,
  prompt_day integer DEFAULT 1, -- Day of week (1-7) or month (1-31)
  prompt_time time DEFAULT '09:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_stats table
CREATE TABLE user_stats (
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

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Achievements are viewable by all authenticated users"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (title, description, icon_name, criteria, points) VALUES
  ('Memory Keeper', 'Create your first memory', 'BookOpen', '{"type": "memory_count", "count": 1}', 10),
  ('Time Traveler', 'Create your first time capsule', 'Clock', '{"type": "capsule_count", "count": 1}', 20),
  ('Legacy Guardian', 'Add your first legacy trustee', 'Users', '{"type": "trustee_count", "count": 1}', 15),
  ('Memory Master', 'Create 100 memories', 'Trophy', '{"type": "memory_count", "count": 100}', 100),
  ('Social Butterfly', 'Share memories with 5 different people', 'Share2', '{"type": "unique_shares", "count": 5}', 50),
  ('Consistent Chronicler', 'Maintain a 7-day memory streak', 'Calendar', '{"type": "streak_days", "count": 7}', 30);

-- Function to create default notification preferences
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default user stats
CREATE OR REPLACE FUNCTION create_default_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for new users
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_stats();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total memories
  UPDATE user_stats
  SET 
    total_memories = total_memories + 1,
    last_memory_at = NEW.created_at,
    memory_streak = CASE 
      WHEN last_memory_at >= CURRENT_DATE - INTERVAL '1 day' THEN memory_streak + 1
      ELSE 1
    END,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating stats on new memory
CREATE TRIGGER on_memory_created
  AFTER INSERT ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();