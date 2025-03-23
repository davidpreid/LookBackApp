/*
  # Initial Schema for Look Back App

  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `category` (text) - e.g., 'movie', 'tv_show', 'achievement', 'activity'
      - `metadata` (jsonb) - For category-specific data
      - `created_at` (timestamptz)
      - `unlock_date` (timestamptz, nullable) - For time capsule feature
      
    - `legacy_access`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - Memory owner
      - `trustee_email` (text) - Email of person granted access
      - `access_type` (text) - Type of access granted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for legacy access trustees
*/

-- Create memories table
CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  unlock_date timestamptz,
  CONSTRAINT valid_category CHECK (category IN ('movie', 'tv_show', 'achievement', 'activity'))
);

-- Create legacy_access table
CREATE TABLE legacy_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  trustee_email text NOT NULL,
  access_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_access_type CHECK (access_type IN ('full', 'limited'))
);

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_access ENABLE ROW LEVEL SECURITY;

-- Policies for memories table
CREATE POLICY "Users can manage their own memories"
  ON memories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Legacy trustees can view memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM legacy_access
      WHERE legacy_access.user_id = memories.user_id
      AND legacy_access.trustee_email = auth.jwt()->>'email'
    )
  );

-- Policies for legacy_access table
CREATE POLICY "Users can manage their legacy access settings"
  ON legacy_access
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trustees can view their access rights"
  ON legacy_access
  FOR SELECT
  TO authenticated
  USING (trustee_email = auth.jwt()->>'email');