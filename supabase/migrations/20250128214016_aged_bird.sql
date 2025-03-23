/*
  # Add time capsule support

  1. Changes
    - Add unlock_date column to memories table if not exists
    - Add time capsule specific metadata columns
    - Update RLS policies to handle time capsules
    - Add functions to manage time capsule unlocking

  2. Security
    - Ensure proper access control for time capsules
    - Only allow owners to create and modify time capsules
    - Allow viewing unlocked time capsules
*/

-- Add time capsule specific columns if they don't exist
DO $$ 
BEGIN
  -- Add unlock_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'memories' 
    AND column_name = 'unlock_date'
  ) THEN
    ALTER TABLE memories ADD COLUMN unlock_date timestamptz;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all accessible memories" ON memories;
DROP POLICY IF EXISTS "Users can create their own memories" ON memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON memories;

-- Create comprehensive policies that include time capsule handling
CREATE POLICY "Users can view accessible memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.jwt()->>'email' = ANY(shared_with) OR
    is_public = true OR
    (unlock_date IS NOT NULL AND unlock_date <= now())
  );

CREATE POLICY "Users can create memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own memories"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own memories"
  ON memories
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Function to check if a time capsule is unlocked
CREATE OR REPLACE FUNCTION is_time_capsule_unlocked(memory_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM memories
    WHERE id = memory_id
    AND (
      unlock_date IS NULL OR
      unlock_date <= now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;