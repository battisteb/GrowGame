-- =============================================================================
-- GrowGame - Habit Completion Functions
-- =============================================================================
-- Migration: 002
-- Created: 2025-12-26
-- Description: PostgreSQL functions for habit completion rewards
-- =============================================================================

-- =============================================================================
-- Function: Add rewards to character
-- =============================================================================

CREATE OR REPLACE FUNCTION add_character_rewards(
  p_character_id UUID,
  p_xp INTEGER,
  p_coins INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Update character XP and coins (prevent negative values)
  UPDATE characters
  SET
    global_xp = GREATEST(0, global_xp + p_xp), -- Prevent negative XP
    coins = GREATEST(0, coins + p_coins), -- Prevent negative coins
    updated_at = now()
  WHERE id = p_character_id
  RETURNING global_xp INTO v_new_xp;

  -- Calculate new level based on XP
  -- Formula: level = floor(sqrt(2 * xp / 100))
  v_new_level := FLOOR(SQRT((2.0 * v_new_xp) / 100.0));

  -- Ensure level is at least 1
  IF v_new_level < 1 THEN
    v_new_level := 1;
  END IF;

  -- Update level if it changed
  UPDATE characters
  SET
    global_level = v_new_level,
    updated_at = now()
  WHERE id = p_character_id;

  -- Update last activity date (for streak tracking)
  UPDATE characters
  SET
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = p_character_id;
END;
$$;

-- =============================================================================
-- Function: Add XP to domain skill
-- =============================================================================

CREATE OR REPLACE FUNCTION add_domain_skill_xp(
  p_character_id UUID,
  p_domain TEXT,
  p_xp INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Update domain skill XP
  UPDATE domain_skills
  SET
    xp = GREATEST(0, xp + p_xp), -- Prevent negative XP
    last_activity_at = now(),
    updated_at = now()
  WHERE character_id = p_character_id
    AND domain = p_domain
  RETURNING xp INTO v_new_xp;

  -- Calculate new level based on XP
  -- Formula: level = floor(sqrt(2 * xp / 100))
  v_new_level := FLOOR(SQRT((2.0 * v_new_xp) / 100.0));

  -- Ensure level is at least 1
  IF v_new_level < 1 THEN
    v_new_level := 1;
  END IF;

  -- Update level if it changed
  UPDATE domain_skills
  SET
    level = v_new_level,
    updated_at = now()
  WHERE character_id = p_character_id
    AND domain = p_domain;
END;
$$;

-- =============================================================================
-- Grant execute permissions to authenticated users
-- =============================================================================

GRANT EXECUTE ON FUNCTION add_character_rewards(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_domain_skill_xp(UUID, TEXT, INTEGER) TO authenticated;
