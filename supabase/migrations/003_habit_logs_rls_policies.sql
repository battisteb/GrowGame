-- =============================================================================
-- GrowGame - Habit Logs RLS Policies
-- =============================================================================
-- Migration: 003
-- Created: 2025-12-27
-- Description: Row Level Security policies for habit_logs table
-- =============================================================================

-- Enable RLS on habit_logs table (if not already enabled)
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (if any)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can insert their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can delete their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can update their own habit logs" ON habit_logs;

-- =============================================================================
-- SELECT POLICY: Users can view habit logs for their own habits
-- =============================================================================

CREATE POLICY "Users can view their own habit logs"
ON habit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM habits
    JOIN characters ON habits.character_id = characters.id
    WHERE habits.id = habit_logs.habit_id
      AND characters.user_id = auth.uid()
  )
);

-- =============================================================================
-- INSERT POLICY: Users can create habit logs for their own habits
-- =============================================================================

CREATE POLICY "Users can insert their own habit logs"
ON habit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM habits
    JOIN characters ON habits.character_id = characters.id
    WHERE habits.id = habit_logs.habit_id
      AND characters.user_id = auth.uid()
  )
);

-- =============================================================================
-- DELETE POLICY: Users can delete habit logs for their own habits
-- =============================================================================

CREATE POLICY "Users can delete their own habit logs"
ON habit_logs
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM habits
    JOIN characters ON habits.character_id = characters.id
    WHERE habits.id = habit_logs.habit_id
      AND characters.user_id = auth.uid()
  )
);

-- =============================================================================
-- UPDATE POLICY: Users can update habit logs for their own habits
-- =============================================================================

CREATE POLICY "Users can update their own habit logs"
ON habit_logs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM habits
    JOIN characters ON habits.character_id = characters.id
    WHERE habits.id = habit_logs.habit_id
      AND characters.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM habits
    JOIN characters ON habits.character_id = characters.id
    WHERE habits.id = habit_logs.habit_id
      AND characters.user_id = auth.uid()
  )
);
