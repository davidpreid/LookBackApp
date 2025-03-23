/*
  # Add Voice Notes Storage Bucket

  1. Create voice-notes bucket
  2. Set up storage policies for voice notes
  3. Enable secure access based on journal entry permissions
*/

-- Create storage bucket for voice notes if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('voice-notes', 'voice-notes', false)  -- Set to private by default
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Voice notes are accessible by entry viewers" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own voice notes" ON storage.objects;

-- Create function to check journal entry access
CREATE OR REPLACE FUNCTION storage.check_journal_entry_access(object_name text)
RETURNS boolean AS $$
DECLARE
  voice_note_id text;
  has_access boolean;
BEGIN
  -- Extract the voice note ID from the path (user_id/voice-note-timestamp.webm)
  voice_note_id := split_part(object_name, '/', 2);
  
  -- Check if the user has access to the journal entry containing this voice note
  SELECT EXISTS (
    SELECT 1
    FROM journal_entries
    WHERE voice_note_url LIKE '%' || voice_note_id || '%'
    AND (
      user_id = auth.uid() OR  -- Owner of the entry
      NOT is_private  -- Public entries
    )
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage policies
CREATE POLICY "Voice notes are accessible by entry viewers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-notes' AND
    (
      -- Allow access if user owns the voice note
      auth.uid()::text = (storage.foldername(name))[1] OR
      -- Or if they have access to the journal entry
      storage.check_journal_entry_access(name)
    )
  );

CREATE POLICY "Users can upload their own voice notes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own voice notes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'voice-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own voice notes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  ); 