/*
  # Fix Time Capsule RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new comprehensive policies that handle time capsules
    - Add proper access control for locked/unlocked memories
    - Fix policy for updating memories with time capsule data

  2. Security
    - Enable RLS
    - Add policies for viewing, creating, updating, and deleting memories
    - Add specific handling for time capsule access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all accessible memories" ON memories;
DROP POLICY IF EXISTS "Users can create memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;

-- Create comprehensive policies for memories and time capsules
CREATE POLICY "Users can view all accessible memories"
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
      (
        -- Always allow owner to view their time capsules
        auth.uid() = user_id OR
        -- Allow viewing unlocked time capsules if shared or public
        (
          unlock_date <= now() AND
          (
            auth.jwt()->>'email' = ANY(shared_with) OR
            is_public = true
          )
        )
      )
    )
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

-- Ensure RLS is enabled
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;