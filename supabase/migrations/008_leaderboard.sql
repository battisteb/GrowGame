-- =============================================================================
-- Migration 008: Leaderboard System
-- =============================================================================
-- Adds weekly ranked XP tracking and leaderboard RPC functions
-- =============================================================================

-- =============================================================================
-- TABLE: weekly_ranked_xp
-- Tracks ranked XP earned per character per week (resets each Monday)
-- =============================================================================

CREATE TABLE weekly_ranked_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(character_id, week_start)
);

CREATE INDEX idx_weekly_ranked_xp_week ON weekly_ranked_xp(week_start, xp_earned DESC);
CREATE INDEX idx_weekly_ranked_xp_char ON weekly_ranked_xp(character_id);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE weekly_ranked_xp ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view leaderboard
CREATE POLICY "Authenticated users can view weekly ranked xp"
  ON weekly_ranked_xp FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can only insert/update their own records
CREATE POLICY "Users can insert their own weekly ranked xp"
  ON weekly_ranked_xp FOR INSERT
  WITH CHECK (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own weekly ranked xp"
  ON weekly_ranked_xp FOR UPDATE
  USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- =============================================================================
-- RPC: record_weekly_ranked_xp
-- Upsert weekly XP for the current week (Monday-based)
-- =============================================================================

CREATE OR REPLACE FUNCTION record_weekly_ranked_xp(
  p_character_id UUID,
  p_xp INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start DATE;
BEGIN
  -- Calculate Monday of current week
  v_week_start := date_trunc('week', CURRENT_DATE)::DATE;

  INSERT INTO weekly_ranked_xp (character_id, week_start, xp_earned)
  VALUES (p_character_id, v_week_start, p_xp)
  ON CONFLICT (character_id, week_start)
  DO UPDATE SET xp_earned = weekly_ranked_xp.xp_earned + p_xp;
END;
$$;

GRANT EXECUTE ON FUNCTION record_weekly_ranked_xp(UUID, INTEGER) TO authenticated;

-- =============================================================================
-- RPC: get_leaderboard
-- Returns ranked leaderboard (global or weekly)
-- =============================================================================

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_type TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  rank BIGINT,
  character_id UUID,
  character_name TEXT,
  ranked_level INTEGER,
  xp INTEGER,
  is_current_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_id UUID;
  v_week_start DATE;
BEGIN
  v_current_user_id := auth.uid();
  v_week_start := date_trunc('week', CURRENT_DATE)::DATE;

  IF p_type = 'global' THEN
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY c.ranked_xp DESC, c.created_at ASC) AS rank,
      c.id AS character_id,
      c.name AS character_name,
      c.ranked_level,
      c.ranked_xp AS xp,
      (c.user_id = v_current_user_id) AS is_current_user
    FROM characters c
    WHERE c.ranked_xp > 0
    ORDER BY c.ranked_xp DESC, c.created_at ASC
    LIMIT p_limit;

  ELSIF p_type = 'weekly' THEN
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY w.xp_earned DESC, w.created_at ASC) AS rank,
      c.id AS character_id,
      c.name AS character_name,
      c.ranked_level,
      w.xp_earned AS xp,
      (c.user_id = v_current_user_id) AS is_current_user
    FROM weekly_ranked_xp w
    JOIN characters c ON c.id = w.character_id
    WHERE w.week_start = v_week_start AND w.xp_earned > 0
    ORDER BY w.xp_earned DESC, w.created_at ASC
    LIMIT p_limit;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard(TEXT, INTEGER) TO authenticated;

-- =============================================================================
-- RPC: get_user_rank
-- Returns the current user's rank in the leaderboard
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_rank(
  p_character_id UUID,
  p_type TEXT
)
RETURNS TABLE (
  rank BIGINT,
  xp INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start DATE;
BEGIN
  v_week_start := date_trunc('week', CURRENT_DATE)::DATE;

  IF p_type = 'global' THEN
    RETURN QUERY
    SELECT sub.rank, sub.xp
    FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY c.ranked_xp DESC, c.created_at ASC) AS rank,
        c.id,
        c.ranked_xp AS xp
      FROM characters c
      WHERE c.ranked_xp > 0
    ) sub
    WHERE sub.id = p_character_id;

  ELSIF p_type = 'weekly' THEN
    RETURN QUERY
    SELECT sub.rank, sub.xp
    FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY w.xp_earned DESC, w.created_at ASC) AS rank,
        w.character_id AS id,
        w.xp_earned AS xp
      FROM weekly_ranked_xp w
      WHERE w.week_start = v_week_start AND w.xp_earned > 0
    ) sub
    WHERE sub.id = p_character_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_rank(UUID, TEXT) TO authenticated;
