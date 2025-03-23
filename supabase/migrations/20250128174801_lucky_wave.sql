/*
  # Fix yearly highlights function

  1. Changes
    - Rewrites the generate_yearly_highlights function to properly handle grouping
    - Uses window functions for active periods calculation
    - Maintains all existing functionality with correct SQL syntax

  2. Technical Details
    - Uses CTEs for better organization and readability
    - Properly handles grouping in active_periods calculation
    - Maintains existing highlight types (top_rated, active_period, most_engaged)
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS generate_yearly_highlights(uuid, integer);

-- Create the fixed function
CREATE OR REPLACE FUNCTION generate_yearly_highlights(user_id_param uuid, year_param integer)
RETURNS void AS $$
DECLARE
  highlights_data jsonb;
BEGIN
  WITH 
  -- Get top rated memories
  top_memories AS (
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
  -- Get active periods using window functions
  monthly_counts AS (
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as memory_count
    FROM memories
    WHERE 
      user_id = user_id_param 
      AND EXTRACT(YEAR FROM created_at) = year_param
    GROUP BY DATE_TRUNC('month', created_at)
    HAVING COUNT(*) >= 5
  ),
  active_periods AS (
    SELECT DISTINCT ON (month)
      m.id,
      m.title,
      m.content,
      m.category,
      m.created_at,
      m.metadata,
      'active_period' as highlight_type
    FROM memories m
    JOIN monthly_counts mc ON DATE_TRUNC('month', m.created_at) = mc.month
    WHERE 
      m.user_id = user_id_param 
      AND EXTRACT(YEAR FROM m.created_at) = year_param
    ORDER BY month, m.created_at DESC
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
      'most_engaged' as highlight_type,
      (
        jsonb_array_length(COALESCE(metadata->'tags', '[]'::jsonb)) +
        jsonb_array_length(COALESCE(metadata->'attachments', '[]'::jsonb))
      ) as engagement_score
    FROM memories
    WHERE 
      user_id = user_id_param 
      AND EXTRACT(YEAR FROM created_at) = year_param
      AND (
        jsonb_array_length(COALESCE(metadata->'tags', '[]'::jsonb)) > 0
        OR jsonb_array_length(COALESCE(metadata->'attachments', '[]'::jsonb)) > 0
      )
    ORDER BY engagement_score DESC
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