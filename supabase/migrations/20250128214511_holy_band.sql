/*
  # Time Capsule Schema Updates

  1. New Columns
    - `capsule_name` (text): Name of the time capsule
    - `capsule_description` (text): Description of the time capsule
    - `capsule_theme` (jsonb): Theme settings for the capsule
    - `capsule_collaborators` (jsonb): List of collaborators with roles
    - `capsule_created_at` (timestamptz): When the capsule was created
    - `capsule_opened_at` (timestamptz): When the capsule was first opened

  2. Security
    - Updated RLS policies to handle time capsule access
    - Added function to check capsule access rights
*/

-- Add new columns for time capsules
ALTER TABLE memories
ADD COLUMN IF NOT EXISTS capsule_name text,
ADD COLUMN IF NOT EXISTS capsule_description text,
ADD COLUMN IF NOT EXISTS capsule_theme jsonb DEFAULT jsonb_build_object(
  'color', '#4F46E5',
  'background', 'bg-white',
  'icon', 'TimerOff'
),
ADD COLUMN IF NOT EXISTS capsule_collaborators jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS capsule_created_at timestamptz,
ADD COLUMN IF NOT EXISTS capsule_opened_at timestamptz;

-- Function to check if a time capsule is accessible
CREATE OR REPLACE FUNCTION is_capsule_accessible(memory_id uuid, checking_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM memories m
    WHERE m.id = memory_id
    AND (
      -- Owner access
      m.user_id = checking_user_id
      OR
      -- Collaborator access
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements(m.capsule_collaborators) AS collab
        WHERE collab->>'email' = (
          SELECT email FROM auth.users WHERE id = checking_user_id
        )
      )
      OR
      -- Time-based access (unlocked capsules)
      (
        m.unlock_date IS NOT NULL
        AND m.unlock_date <= now()
        AND (
          m.is_public = true
          OR checking_user_id = m.user_id
          OR auth.jwt()->>'email' = ANY(m.shared_with)
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view accessible memories" ON memories;
DROP POLICY IF EXISTS "Users can create memories and time capsules" ON memories;
DROP POLICY IF EXISTS "Users can update own memories and time capsules" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories and time capsules" ON memories;

-- Create updated policies
CREATE POLICY "Users can view accessible memories and capsules"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    -- Regular memory access
    auth.uid() = user_id
    OR auth.jwt()->>'email' = ANY(shared_with)
    OR is_public = true
    OR
    -- Time capsule access
    (
      unlock_date IS NOT NULL
      AND (
        -- Unlocked capsules
        (unlock_date <= now() AND (
          auth.uid() = user_id
          OR auth.jwt()->>'email' = ANY(shared_with)
          OR is_public = true
        ))
        OR
        -- Collaborator access
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(capsule_collaborators) AS collab
          WHERE collab->>'email' = auth.jwt()->>'email'
        )
      )
    )
  );

CREATE POLICY "Users can create memories and capsules"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own memories and capsules"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(capsule_collaborators) AS collab
      WHERE collab->>'email' = auth.jwt()->>'email'
      AND collab->>'role' = 'contributor'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(capsule_collaborators) AS collab
      WHERE collab->>'email' = auth.jwt()->>'email'
      AND collab->>'role' = 'contributor'
    )
  );

CREATE POLICY "Users can delete own memories and capsules"
  ON memories
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Function to mark capsule as opened
CREATE OR REPLACE FUNCTION mark_capsule_opened()
RETURNS trigger AS $$
BEGIN
  IF NEW.unlock_date IS NOT NULL AND NEW.unlock_date <= now() AND NEW.capsule_opened_at IS NULL THEN
    NEW.capsule_opened_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically mark capsules as opened
CREATE TRIGGER on_capsule_access
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION mark_capsule_opened();