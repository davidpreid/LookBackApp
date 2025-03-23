/*
  # Update category system
  
  1. Changes
    - Add memory_category enum type
    - Create category_metadata table
    - Convert existing categories to new system
    
  2. Security
    - Enable RLS on category_metadata
    - Add policy for authenticated users to read metadata
*/

-- First convert memories.category to text if it's not already
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'memories' 
    AND column_name = 'category'
    AND data_type <> 'text'
  ) THEN
    ALTER TABLE memories ALTER COLUMN category TYPE text;
  END IF;
END $$;

-- Drop existing objects with proper dependency handling
DO $$ 
BEGIN
  -- Drop existing category_metadata table if it exists
  DROP TABLE IF EXISTS category_metadata CASCADE;
  
  -- Drop existing type if it exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_category') THEN
    DROP TYPE memory_category CASCADE;
  END IF;
END $$;

-- Create memory category type
CREATE TYPE memory_category AS ENUM (
  -- Entertainment
  'movie', 'tv_show', 'concert', 'podcast', 'book',
  -- Personal Life
  'birthday', 'anniversary', 'family_gathering', 'personal_milestone',
  -- Hobbies
  'game', 'sport', 'art_craft', 'photography',
  -- Travel
  'trip', 'outdoor_activity', 'museum_visit',
  -- Health
  'exercise', 'meditation', 'medical', 'nutrition',
  -- Work
  'work_achievement', 'certification', 'school_project', 'conference',
  -- Social
  'meetup', 'party', 'volunteer_work',
  -- Food
  'restaurant', 'recipe', 'new_dish',
  -- Special Occasions
  'holiday', 'festival', 'wedding', 'religious_event',
  -- Other
  'random_act', 'unexpected_moment', 'note'
);

-- Create category metadata table
CREATE TABLE category_metadata (
  category memory_category PRIMARY KEY,
  icon_name text NOT NULL,
  color text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE category_metadata ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read category metadata
CREATE POLICY "Category metadata is readable by all authenticated users"
  ON category_metadata
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert category metadata
INSERT INTO category_metadata (category, icon_name, color, description) VALUES
  -- Entertainment
  ('movie', 'Film', '#FF5733', 'Movies watched in theaters or at home'),
  ('tv_show', 'Tv', '#33FF57', 'TV series and shows'),
  ('concert', 'Music', '#3357FF', 'Live music performances'),
  ('podcast', 'Headphones', '#FF33F5', 'Podcast episodes and series'),
  ('book', 'BookOpen', '#33FFF5', 'Books read'),
  -- Personal Life
  ('birthday', 'Cake', '#FFB533', 'Birthday celebrations'),
  ('anniversary', 'Heart', '#FF3333', 'Important anniversaries'),
  ('family_gathering', 'Users', '#33FF33', 'Family get-togethers'),
  ('personal_milestone', 'Star', '#3333FF', 'Personal achievements and milestones'),
  -- Hobbies
  ('game', 'Gamepad2', '#FF33B5', 'Video games and board games'),
  ('sport', 'Trophy', '#33FFB5', 'Sports activities and events'),
  ('art_craft', 'Palette', '#B533FF', 'Art and craft projects'),
  ('photography', 'Camera', '#33B5FF', 'Photography sessions and projects'),
  -- Travel
  ('trip', 'Plane', '#FFB533', 'Trips and vacations'),
  ('outdoor_activity', 'Mountain', '#33FFB5', 'Hiking and outdoor adventures'),
  ('museum_visit', 'Building2', '#B533FF', 'Museum and historical site visits'),
  -- Health
  ('exercise', 'Activity', '#FF3333', 'Workouts and physical activities'),
  ('meditation', 'Moon', '#33FF33', 'Meditation and mindfulness sessions'),
  ('medical', 'Stethoscope', '#3333FF', 'Medical appointments and health updates'),
  ('nutrition', 'Apple', '#FF33B5', 'Diet and nutrition tracking'),
  -- Work
  ('work_achievement', 'Award', '#33FFB5', 'Work-related achievements'),
  ('certification', 'GraduationCap', '#B533FF', 'Professional certifications'),
  ('school_project', 'BookOpen', '#33B5FF', 'Educational projects'),
  ('conference', 'Users', '#FFB533', 'Conferences and workshops'),
  -- Social
  ('meetup', 'Coffee', '#FF5733', 'Social meetups'),
  ('party', 'Party', '#33FF57', 'Parties and celebrations'),
  ('volunteer_work', 'Heart', '#3357FF', 'Volunteer activities'),
  -- Food
  ('restaurant', 'Utensils', '#FF33F5', 'Restaurant visits'),
  ('recipe', 'ChefHat', '#33FFF5', 'Cooking experiences'),
  ('new_dish', 'UtensilsCrossed', '#FFB533', 'New food experiences'),
  -- Special Occasions
  ('holiday', 'Gift', '#FF3333', 'Holiday celebrations'),
  ('festival', 'PartyPopper', '#33FF33', 'Festival experiences'),
  ('wedding', 'Ring', '#3333FF', 'Wedding celebrations'),
  ('religious_event', 'Church', '#FF33B5', 'Religious ceremonies and events'),
  -- Other
  ('random_act', 'Sparkles', '#33FFB5', 'Random acts of kindness'),
  ('unexpected_moment', 'Zap', '#B533FF', 'Unexpected memorable moments'),
  ('note', 'Pencil', '#33B5FF', 'General notes and thoughts');

-- Update existing memories to use new categories
DO $$
BEGIN
  -- First ensure the column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'memories' 
    AND column_name = 'category'
  ) THEN
    -- Update existing categories
    UPDATE memories
    SET category = CASE category
      WHEN 'movie' THEN 'movie'
      WHEN 'tv_show' THEN 'tv_show'
      WHEN 'achievement' THEN 'personal_milestone'
      WHEN 'activity' THEN 'note'
      ELSE 'note'
    END;

    -- Now convert the column type to memory_category
    ALTER TABLE memories 
    ALTER COLUMN category TYPE memory_category 
    USING category::memory_category;
  END IF;
END $$;