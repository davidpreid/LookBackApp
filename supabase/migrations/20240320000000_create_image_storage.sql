-- Create the storage bucket for memory images
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-images', 'memory-images', false);

-- Enable Row Level Security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the memory-images bucket

-- Policy for SELECT (viewing images)
CREATE POLICY "Users can view their own and shared memories"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'memory-images' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM memories m
      WHERE m.metadata->>'attachments' LIKE '%' || name || '%'
      AND (m.is_public = true OR m.shared_with @> ARRAY[auth.uid()::text])
    )
  )
);

-- Policy for INSERT (uploading images)
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'memory-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for DELETE (removing images)
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'memory-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_owner ON storage.objects(owner);

-- Add a function to clean up orphaned files
CREATE OR REPLACE FUNCTION storage.cleanup_orphaned_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'memory-images'
  AND NOT EXISTS (
    SELECT 1 FROM memories m
    WHERE m.metadata->>'attachments' LIKE '%' || name || '%'
  );
END;
$$;

-- Add a function to get signed URLs with proper access control
CREATE OR REPLACE FUNCTION storage.get_signed_url(
  bucket_name text,
  object_path text,
  expires_in interval
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url text;
BEGIN
  -- Check if the user has access to the file
  IF EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = bucket_name
    AND name = object_path
    AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM memories m
        WHERE m.metadata->>'attachments' LIKE '%' || name || '%'
        AND (m.is_public = true OR m.shared_with @> ARRAY[auth.uid()::text])
      )
    )
  ) THEN
    -- Generate signed URL using Supabase's built-in function
    signed_url := storage.get_signed_url_internal(bucket_name, object_path, expires_in);
    RETURN signed_url;
  ELSE
    RAISE EXCEPTION 'Access denied';
  END IF;
END;
$$;

-- Add a trigger to automatically delete files when a memory is deleted
CREATE OR REPLACE FUNCTION storage.delete_memory_files()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Extract file paths from the old memory's attachments
  IF OLD.metadata->>'attachments' IS NOT NULL THEN
    WITH attachment_paths AS (
      SELECT jsonb_array_elements(OLD.metadata->'attachments') as attachment
    )
    DELETE FROM storage.objects
    WHERE bucket_id = 'memory-images'
    AND name IN (
      SELECT attachment->>'path'
      FROM attachment_paths
      WHERE attachment->>'path' IS NOT NULL
    );
  END IF;
  RETURN OLD;
END;
$$;

-- Create the trigger
CREATE TRIGGER delete_memory_files_trigger
  AFTER DELETE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION storage.delete_memory_files();

-- Add a function to validate file types
CREATE OR REPLACE FUNCTION storage.validate_file_type(
  file_name text,
  allowed_types text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN LOWER(split_part(file_name, '.', 2)) = ANY(allowed_types);
END;
$$;

-- Add a function to get file size
CREATE OR REPLACE FUNCTION storage.get_file_size(
  bucket_name text,
  object_path text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT metadata->>'size'::bigint
    FROM storage.objects
    WHERE bucket_id = bucket_name
    AND name = object_path
  );
END;
$$; 