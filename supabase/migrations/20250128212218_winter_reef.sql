/*
  # Fix memories table RLS policies

  1. Changes
    - Drop existing RLS policies for memories table
    - Create new comprehensive RLS policies for memories table
    - Add policies for:
      - Viewing memories (own, shared, public)
      - Creating memories
      - Updating memories
      - Deleting memories

  2. Security
    - Enable RLS on memories table
    - Ensure proper access control for all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own memories" ON memories;
DROP POLICY IF EXISTS "Public memories are viewable" ON memories;
DROP POLICY IF EXISTS "Shared memories are viewable" ON memories;

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