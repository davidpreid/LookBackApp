/*
  # Fix time capsule RLS policies

  1. Changes
    - Update RLS policies to properly handle time capsules
    - Add specific policies for time capsule operations
    - Ensure proper access control for time capsules

  2. Security
    - Only allow owners to create and modify time capsules
    - Allow viewing unlocked time capsules
    - Maintain existing sharing and public access rules
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view accessible memories" ON memories;
DROP POLICY IF EXISTS "Users can create memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;

-- Create comprehensive policies for memories and time capsules
CREATE POLICY "Users can view accessible memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    -- Regular memory access
    auth.uid() = user_id OR
    auth.jwt()->>'email' = ANY(shared_with) OR
    is_public = true OR
    -- Time capsule access
    (
      unlock_date IS NOT NULL AND
      unlock_date <= now() AND
      (
        auth.uid() = user_id OR
        auth.jwt()->>'email' = ANY(shared_with) OR
        is_public = true
      )
    )
  );

CREATE POLICY "Users can create memories and time capsules"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own memories and time capsules"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own memories and time capsules"
  ON memories
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Function to check if a memory is accessible
CREATE OR REPLACE FUNCTION is_memory_accessible(memory_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_id
    AND (
      -- Regular memory access
      m.user_id = user_id OR
      auth.jwt()->>'email' = ANY(m.shared_with) OR
      m.is_public = true OR
      -- Time capsule access
      (
        m.unlock_date IS NOT NULL AND
        m.unlock_date <= now() AND
        (
          m.user_id = user_id OR
          auth.jwt()->>'email' = ANY(m.shared_with) OR
          m.is_public = true
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;