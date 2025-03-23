/*
  # Remove Memory Restrictions

  1. Changes
    - Remove category restrictions to allow any type of memory
    - Remove access type restrictions for legacy access
    - Add shared_with array and is_public flag for social sharing
    - Add collaborators array for group memories
    - Update RLS policies for public and shared access

  2. Security
    - Maintain RLS but with more flexible sharing options
    - Add policies for public access and collaborators
*/

-- Remove category constraint
ALTER TABLE memories DROP CONSTRAINT IF EXISTS valid_category;

-- Remove access type constraint
ALTER TABLE legacy_access DROP CONSTRAINT IF EXISTS valid_access_type;

-- Add sharing columns to memories
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS shared_with text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS collaborators jsonb DEFAULT '[]'::jsonb;

-- Update RLS policies for memories
DROP POLICY IF EXISTS "Users can manage their own memories" ON memories;
DROP POLICY IF EXISTS "Legacy trustees can view memories" ON memories;

-- New flexible policies
CREATE POLICY "Users can manage their own memories"
ON memories
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id 
  OR auth.jwt()->>'email' = ANY(shared_with)
  OR is_public = true
  OR EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(collaborators) AS c 
    WHERE c->>'email' = auth.jwt()->>'email'
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(collaborators) AS c 
    WHERE c->>'email' = auth.jwt()->>'email' 
    AND c->>'role' = 'contributor'
  )
);

CREATE POLICY "Public memories are viewable"
ON memories
FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "Shared memories are viewable"
ON memories
FOR SELECT
TO authenticated
USING (
  auth.jwt()->>'email' = ANY(shared_with)
  OR EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(collaborators) AS c 
    WHERE c->>'email' = auth.jwt()->>'email'
  )
);