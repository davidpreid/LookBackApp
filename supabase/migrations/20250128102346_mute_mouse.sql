/*
  # Add Yearly Highlights Support

  1. New Tables
    - `yearly_highlights` table for storing curated yearly highlights
    - Includes automatic and manual selections
    - Supports highlight customization

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create yearly_highlights table
CREATE TABLE yearly_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  year integer NOT NULL,
  highlights jsonb DEFAULT '[]'::jsonb,
  custom_highlights jsonb DEFAULT '[]'::jsonb,
  is_customized boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable RLS
ALTER TABLE yearly_highlights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own highlights"
  ON yearly_highlights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically generate highlights
CREATE OR REPLACE FUNCTION generate_yearly_highlights(user_id_param uuid, year_param integer)
RETURNS void AS $$
DECLARE
  highlights_data jsonb;
BEGIN
  -- Get top rated memories
  WITH top_memories AS (
    SELECT 
      id,
      title,
      content,
      category,
      created_at,
      metadata,
      'top_rated' as highlight_type
    FROM memories
    WHERE 
      user_id = user_id_param 
      AND EXTRACT(YEAR FROM created_at) = year_param
      AND (metadata->>'rating')::integer >= 4
    ORDER BY (metadata->>'rating')::integer DESC
    LIMIT 3
  ),
  -- Get most active periods
  active_periods AS (
    SELECT 
      id,
      title,
      content,
      category,
      created_at,
      metadata,
      'active_period' as highlight_type
    FROM memories
    WHERE 
      user_id = user_id_param 
      AND EXTRACT(YEAR FROM created_at) = year_param
    GROUP BY DATE_TRUNC('month', created_at)
    HAVING COUNT(*) >= 5
    ORDER BY COUNT(*) DESC
    LIMIT 2
  ),
  -- Get memories with most interactions
  engaged_memories AS (
    SELECT 
      id,
      title,
      content,
      category,
      created_at,
      metadata,
      'most_engaged' as highlight_type
    FROM memories
    WHERE 
      user_id = user_id_param 
      AND EXTRACT(YEAR FROM created_at) = year_param
      AND (
        jsonb_array_length(COALESCE(metadata->'tags', '[]'::jsonb)) > 0
        OR jsonb_array_length(COALESCE(metadata->'attachments', '[]'::jsonb)) > 0
      )
    ORDER BY (
      jsonb_array_length(COALESCE(metadata->'tags', '[]'::jsonb)) +
      jsonb_array_length(COALESCE(metadata->'attachments', '[]'::jsonb))
    ) DESC
    LIMIT 3
  )
  -- Combine all highlights
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'content', content,
      'category', category,
      'created_at', created_at,
      'metadata', metadata,
      'highlight_type', highlight_type
    )
  )
  INTO highlights_data
  FROM (
    SELECT * FROM top_memories
    UNION ALL
    SELECT * FROM active_periods
    UNION ALL
    SELECT * FROM engaged_memories
  ) combined;

  -- Insert or update yearly highlights
  INSERT INTO yearly_highlights (user_id, year, highlights)
  VALUES (user_id_param, year_param, COALESCE(highlights_data, '[]'::jsonb))
  ON CONFLICT (user_id, year)
  DO UPDATE SET 
    highlights = EXCLUDED.highlights,
    updated_at = now()
  WHERE NOT yearly_highlights.is_customized;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update highlights when memories change
CREATE OR REPLACE FUNCTION update_yearly_highlights()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_yearly_highlights(
    NEW.user_id,
    EXTRACT(YEAR FROM NEW.created_at)::integer
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update highlights on memory changes
CREATE TRIGGER on_memory_change
  AFTER INSERT OR UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_yearly_highlights();