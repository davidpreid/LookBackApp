/*
  # Fix Security and Performance Issues
  
  1. Performance Improvements
    - Add missing indexes on foreign keys:
      - journal_entries.user_id
      - legacy_access.user_id
      - memories.user_id
      - user_achievements.achievement_id
    - Remove unused index: journal_entries_entry_date_idx
    
  2. RLS Policy Optimization
    - Optimize all auth function calls to use (select auth.uid()) pattern
    - Consolidate duplicate policies:
      - memories: Merge overlapping SELECT/INSERT/UPDATE/DELETE policies
      - profiles: Merge overlapping SELECT/INSERT/UPDATE policies
      - notification_preferences: Merge overlapping policies
      - user_stats: Merge overlapping SELECT policies
      - legacy_access: Merge overlapping SELECT policies
      
  3. Function Security
    - Fix mutable search_path on all functions
    
  Note: The following issues require Supabase dashboard configuration:
    - Leaked Password Protection (enable in Auth settings)
    - Postgres version upgrade (infrastructure-level)
*/

-- ============================================================================
-- PART 1: ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

-- Index for journal_entries.user_id
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);

-- Index for legacy_access.user_id
CREATE INDEX IF NOT EXISTS idx_legacy_access_user_id ON public.legacy_access(user_id);

-- Index for memories.user_id
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);

-- Index for user_achievements.achievement_id
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Remove unused index
DROP INDEX IF EXISTS public.journal_entries_entry_date_idx;

-- ============================================================================
-- PART 2: CONSOLIDATE AND OPTIMIZE RLS POLICIES - MEMORIES TABLE
-- ============================================================================

-- Drop all existing memory policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all accessible memories" ON public.memories;
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can view accessible memories and capsules" ON public.memories;
DROP POLICY IF EXISTS "Users can create memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create memories and capsules" ON public.memories;
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update own memories and capsules" ON public.memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete own memories and capsules" ON public.memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.memories;

-- Create optimized unified policies for memories
CREATE POLICY "Users can view their accessible memories"
  ON public.memories
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR is_public = true
    OR (unlock_date IS NOT NULL AND unlock_date <= now())
  );

CREATE POLICY "Users can insert memories"
  ON public.memories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their memories"
  ON public.memories
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their memories"
  ON public.memories
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 3: CONSOLIDATE AND OPTIMIZE RLS POLICIES - PROFILES TABLE
-- ============================================================================

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create optimized unified policies for profiles
CREATE POLICY "Users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- PART 4: CONSOLIDATE AND OPTIMIZE RLS POLICIES - NOTIFICATION_PREFERENCES
-- ============================================================================

-- Drop existing notification_preferences policies
DROP POLICY IF EXISTS "Users can manage their notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;

-- Create optimized unified policies for notification_preferences
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notification preferences"
  ON public.notification_preferences
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 5: CONSOLIDATE AND OPTIMIZE RLS POLICIES - USER_STATS
-- ============================================================================

-- Drop existing user_stats policies
DROP POLICY IF EXISTS "Users can view their stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;

-- Create optimized unified policy for user_stats
CREATE POLICY "Users can view own stats"
  ON public.user_stats
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 6: CONSOLIDATE AND OPTIMIZE RLS POLICIES - LEGACY_ACCESS
-- ============================================================================

-- Drop existing legacy_access policies
DROP POLICY IF EXISTS "Users can manage their legacy access settings" ON public.legacy_access;
DROP POLICY IF EXISTS "Trustees can view their access rights" ON public.legacy_access;

-- Create optimized unified policy for legacy_access
CREATE POLICY "Users can manage legacy access"
  ON public.legacy_access
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR trustee_email = (select (auth.jwt()->>'email'))
  );

CREATE POLICY "Users can insert legacy access"
  ON public.legacy_access
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update legacy access"
  ON public.legacy_access
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete legacy access"
  ON public.legacy_access
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 7: OPTIMIZE REMAINING RLS POLICIES
-- ============================================================================

-- Optimize yearly_highlights policy
DROP POLICY IF EXISTS "Users can manage their own highlights" ON public.yearly_highlights;
CREATE POLICY "Users can manage own highlights"
  ON public.yearly_highlights
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Optimize user_achievements policy
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Optimize journal_entries policy
DROP POLICY IF EXISTS "Users can manage their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view own journal entries"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Optimize debug_logs policy
DROP POLICY IF EXISTS "Debug logs are only visible to admins" ON public.debug_logs;
CREATE POLICY "Admin can view debug logs"
  ON public.debug_logs
  FOR SELECT
  TO authenticated
  USING ((select (auth.jwt()->>'role')) = 'admin');

-- ============================================================================
-- PART 8: FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix search_path for public functions
ALTER FUNCTION public.update_journal_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_trigger_exists(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_rls_policies() SET search_path = public, pg_temp;
ALTER FUNCTION public.list_functions() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.run_sql(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_table_if_not_exists(text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.enable_rls(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_policy(text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_database_setup() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_yearly_highlights() SET search_path = public, pg_temp;
ALTER FUNCTION public.convert_old_categories() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_default_notification_preferences() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_default_user_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_user_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.ensure_user_defaults() SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_yearly_highlights(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_time_capsule_unlocked(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_memory_accessible(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_capsule_accessible(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.mark_capsule_opened() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_profile_for_user() SET search_path = public, pg_temp;

-- Fix search_path for app_storage functions
ALTER FUNCTION app_storage.cleanup_orphaned_files() SET search_path = public, pg_temp;
ALTER FUNCTION app_storage.get_signed_url(text, text, interval) SET search_path = public, pg_temp;
ALTER FUNCTION app_storage.delete_memory_files() SET search_path = public, pg_temp;
ALTER FUNCTION app_storage.validate_file_type(text, text[]) SET search_path = public, pg_temp;
ALTER FUNCTION app_storage.get_file_size(text, text) SET search_path = public, pg_temp;
ALTER FUNCTION app_storage.check_journal_entry_access(text) SET search_path = public, pg_temp;
