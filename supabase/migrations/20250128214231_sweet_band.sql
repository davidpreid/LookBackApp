/*
  # Enhance time capsule functionality

  1. Changes
    - Add name column for time capsules
    - Add description column for time capsules
    - Add theme column for time capsules

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Add new columns for time capsules
ALTER TABLE memories
ADD COLUMN IF NOT EXISTS capsule_name text,
ADD COLUMN IF NOT EXISTS capsule_description text,
ADD COLUMN IF NOT EXISTS capsule_theme jsonb DEFAULT jsonb_build_object(
  'color', '#4F46E5',
  'background', 'bg-white',
  'icon', 'TimerOff'
);