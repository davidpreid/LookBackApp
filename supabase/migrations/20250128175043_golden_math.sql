/*
  # Add theme column to yearly_highlights

  1. Changes
    - Adds theme column to yearly_highlights table
    - Theme column stores color, font, and background preferences
    - Maintains existing data

  2. Technical Details
    - Uses JSONB type for flexibility
    - Adds default theme values
*/

-- Add theme column to yearly_highlights
ALTER TABLE yearly_highlights
ADD COLUMN IF NOT EXISTS theme jsonb DEFAULT jsonb_build_object(
  'color', '#4F46E5',
  'font', 'Inter',
  'background', 'bg-white'
);

-- Update existing rows with default theme
UPDATE yearly_highlights
SET theme = jsonb_build_object(
  'color', '#4F46E5',
  'font', 'Inter',
  'background', 'bg-white'
)
WHERE theme IS NULL;