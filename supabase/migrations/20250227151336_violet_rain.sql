/*
  # Update journal entries schema
  
  1. Changes
    - Remove title column
    - Add entry_date column
    - Update RLS policies
*/

-- Add entry_date column
ALTER TABLE journal_entries 
DROP COLUMN title,
ADD COLUMN entry_date date NOT NULL DEFAULT CURRENT_DATE;

-- Create index on entry_date for better query performance
CREATE INDEX journal_entries_entry_date_idx ON journal_entries(entry_date);

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can manage their own journal entries" ON journal_entries;

CREATE POLICY "Users can manage their own journal entries"
  ON journal_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);