/*
  # Fix Remaining RLS Policy Issues
  
  1. RLS Policy Fixes
    - Fix legacy_access policy to properly use (select auth.jwt()->>'email')
    - Fix debug_logs policy to properly use (select auth.jwt()->>'role')
    
  2. Index Notes
    - The "unused" indexes were just created and will be used automatically by queries
    - They are essential for foreign key performance and should remain
    
  Note: The following issues require Supabase dashboard configuration:
    - Leaked Password Protection (enable in Auth settings)
    - Postgres version upgrade (infrastructure-level)
*/

-- ============================================================================
-- FIX LEGACY_ACCESS RLS POLICY
-- ============================================================================

-- Drop and recreate the policy with proper optimization
DROP POLICY IF EXISTS "Users can manage legacy access" ON public.legacy_access;

CREATE POLICY "Users can manage legacy access"
  ON public.legacy_access
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR trustee_email = (select auth.jwt()->>'email')
  );

-- ============================================================================
-- FIX DEBUG_LOGS RLS POLICY
-- ============================================================================

-- Drop and recreate the policy with proper optimization
DROP POLICY IF EXISTS "Admin can view debug logs" ON public.debug_logs;

CREATE POLICY "Admin can view debug logs"
  ON public.debug_logs
  FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'role') = 'admin');

-- ============================================================================
-- ANALYZE TABLES TO UPDATE INDEX STATISTICS
-- ============================================================================

-- Run ANALYZE on tables to update statistics and help the query planner
-- This will help the newly created indexes be recognized
ANALYZE public.journal_entries;
ANALYZE public.legacy_access;
ANALYZE public.memories;
ANALYZE public.user_achievements;
