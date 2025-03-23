-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all accessible memories" ON memories;
DROP POLICY IF EXISTS "Users can create memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;

-- Create comprehensive policies
CREATE POLICY "Users can view all accessible memories"
  ON memories
  FOR SELECT
  TO public
  USING (
    -- Allow viewing public memories without authentication
    is_public = true OR
    -- For authenticated users, also allow their own and shared memories
    (
      auth.role() = 'authenticated' AND
      (
        auth.uid() = user_id OR
        auth.jwt()->>'email' = ANY(shared_with) OR
        -- Time capsule access for authenticated users
        (
          unlock_date IS NOT NULL AND
          (
            -- Owner can always view their time capsules
            auth.uid() = user_id OR
            -- Others can view unlocked time capsules if shared or public
            (
              unlock_date <= now() AND
              (
                auth.jwt()->>'email' = ANY(shared_with) OR
                is_public = true
              )
            )
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