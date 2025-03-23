/*
  # Enhanced Categories Implementation

  1. Changes
    - Add new categories to memories table
    - Update existing data to match new categories
    - Add category metadata support

  2. Security
    - Maintain existing RLS policies
*/

-- Add new category enum type
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

-- Add category metadata table for additional category information
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

-- Function to validate and convert old categories
CREATE OR REPLACE FUNCTION convert_old_categories()
RETURNS void AS $$
BEGIN
  -- Update existing memories to use new categories
  -- Map old categories to new ones
  UPDATE memories
  SET category = CASE category
    WHEN 'movie' THEN 'movie'::memory_category
    WHEN 'tv_show' THEN 'tv_show'::memory_category
    WHEN 'achievement' THEN 'personal_milestone'::memory_category
    WHEN 'activity' THEN 'note'::memory_category
    ELSE 'note'::memory_category
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convert existing categories
SELECT convert_old_categories();

-- Add check constraint for new categories
ALTER TABLE memories
  ALTER COLUMN category TYPE memory_category USING category::memory_category;