/*
  # Fix memories table RLS policies

  1. Changes
    - Drop existing RLS policies for memories table
    - Create new comprehensive RLS policies with proper access control
    - Add policies for all CRUD operations
    - Fix policy ordering to ensure proper access control

  2. Security
    - Enable RLS on memories table
    - Ensure proper access control for all operations
    - Handle shared and public memories correctly
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own memories" ON memories;
DROP POLICY IF EXISTS "Users can view shared memories" ON memories;
DROP POLICY IF EXISTS "Users can view public memories" ON memories;
DROP POLICY IF EXISTS "Users can create their own memories" ON memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON memories;

-- Create new policies
CREATE POLICY "Users can view their own memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can view shared memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'email' = ANY(shared_with)
  );

CREATE POLICY "Users can view public memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    is_public = true
  );

CREATE POLICY "Users can create their own memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own memories"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own memories"
  ON memories
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Ensure RLS is enabled
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;