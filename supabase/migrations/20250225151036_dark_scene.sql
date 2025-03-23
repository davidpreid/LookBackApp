/*
  # Update memories and profiles relationship

  1. Changes
    - Safely handle existing foreign key constraint
    - Update RLS policies to maintain security
*/

-- Safely handle foreign key constraint
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'memories_user_id_fkey'
    AND table_name = 'memories'
  ) THEN
    ALTER TABLE memories DROP CONSTRAINT memories_user_id_fkey;
  END IF;

  -- Add constraint with cascade delete
  ALTER TABLE memories
  ADD CONSTRAINT memories_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN
    -- If anything goes wrong, ensure the constraint exists
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'memories_user_id_fkey'
      AND table_name = 'memories'
    ) THEN
      ALTER TABLE memories
      ADD CONSTRAINT memories_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can view all accessible memories" ON memories;
DROP POLICY IF EXISTS "Users can create memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;

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