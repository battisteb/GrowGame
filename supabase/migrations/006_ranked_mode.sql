/**
 * Migration 006: Ranked Mode
 *
 * Adds ranked mode functionality for competitive habit tracking:
 * - ranked_xp and ranked_level to characters table
 * - completion_mode to habit_logs table
 * - add_ranked_xp() RPC function for awarding ranked XP
 */

-- ============================================================================
-- ADD RANKED FIELDS TO CHARACTERS
-- ============================================================================

ALTER TABLE characters
  ADD COLUMN ranked_xp INTEGER DEFAULT 0 CHECK (ranked_xp >= 0),
  ADD COLUMN ranked_level INTEGER DEFAULT 1 CHECK (ranked_level >= 1);

COMMENT ON COLUMN characters.ranked_xp IS 'Total ranked XP earned from verified photo completions';
COMMENT ON COLUMN characters.ranked_level IS 'Ranked level calculated from ranked_xp (for future ELO system)';

-- ============================================================================
-- ADD COMPLETION_MODE TO HABIT_LOGS
-- ============================================================================

ALTER TABLE habit_logs
  ADD COLUMN completion_mode TEXT DEFAULT 'normal'
    CHECK (completion_mode IN ('normal', 'ranked'));

COMMENT ON COLUMN habit_logs.completion_mode IS 'Completion mode: normal (no photo) or ranked (photo verified)';

-- ============================================================================
-- RPC FUNCTION: ADD_RANKED_XP
-- ============================================================================

/**
 * Add ranked XP to a character and recalculate ranked level
 *
 * Similar to add_domain_skill_xp and add_character_rewards
 * Uses the same level formula: floor(sqrt(2 * xp / 100))
 *
 * @param p_character_id - The character ID
 * @param p_xp - The ranked XP to add (can be negative to remove)
 */
CREATE OR REPLACE FUNCTION add_ranked_xp(
  p_character_id UUID,
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
  -- Update ranked XP (prevent negative)
  UPDATE characters
  SET
    ranked_xp = GREATEST(0, ranked_xp + p_xp),
    updated_at = now()
  WHERE id = p_character_id
  RETURNING ranked_xp INTO v_new_xp;

  -- Calculate new level using same formula as global level
  -- Formula: level = floor(sqrt(2 * xp / 100))
  v_new_level := FLOOR(SQRT((2.0 * v_new_xp) / 100.0));

  -- Ensure minimum level of 1
  IF v_new_level < 1 THEN
    v_new_level := 1;
  END IF;

  -- Update ranked level
  UPDATE characters
  SET ranked_level = v_new_level
  WHERE id = p_character_id;

  -- Log the update
  RAISE NOTICE 'Ranked XP updated for character %: % XP → Level %', p_character_id, v_new_xp, v_new_level;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_ranked_xp(UUID, INTEGER) TO authenticated;

COMMENT ON FUNCTION add_ranked_xp IS 'Adds ranked XP to a character and recalculates ranked level';
