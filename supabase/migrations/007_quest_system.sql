-- =============================================================================
-- Migration 007: Quest System
-- =============================================================================
-- Adds daily quests (semi-random, reset daily) and achievements (permanent)
-- =============================================================================

-- =============================================================================
-- TABLE: daily_quests
-- Stores 3 daily quests per character per day
-- =============================================================================

CREATE TABLE daily_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  template_id TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}',
  current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
  target INTEGER NOT NULL CHECK (target >= 1),
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_daily_quests_char_date_template
  ON daily_quests(character_id, quest_date, template_id);
CREATE INDEX idx_daily_quests_char_date
  ON daily_quests(character_id, quest_date);

-- =============================================================================
-- TABLE: achievements
-- Permanent progression quests (one-time unlock)
-- =============================================================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
  target INTEGER NOT NULL CHECK (target >= 1),
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(character_id, achievement_id)
);

CREATE INDEX idx_achievements_char ON achievements(character_id);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- daily_quests: users can only access their own
CREATE POLICY "Users can view their own daily quests"
  ON daily_quests FOR SELECT
  USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own daily quests"
  ON daily_quests FOR INSERT
  WITH CHECK (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own daily quests"
  ON daily_quests FOR UPDATE
  USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- achievements: same pattern
CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own achievements"
  ON achievements FOR INSERT
  WITH CHECK (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own achievements"
  ON achievements FOR UPDATE
  USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- =============================================================================
-- RPC: claim_quest_reward
-- Atomic claim: verify completion, mark claimed, award rewards
-- =============================================================================

CREATE OR REPLACE FUNCTION claim_quest_reward(
  p_quest_id UUID,
  p_character_id UUID,
  p_quest_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward_xp INTEGER;
  v_reward_coins INTEGER;
  v_is_claimed BOOLEAN;
  v_current INTEGER;
  v_target INTEGER;
BEGIN
  IF p_quest_type = 'daily' THEN
    SELECT reward_xp, reward_coins, is_claimed, current_progress, target
    INTO v_reward_xp, v_reward_coins, v_is_claimed, v_current, v_target
    FROM daily_quests
    WHERE id = p_quest_id AND character_id = p_character_id;
  ELSIF p_quest_type = 'achievement' THEN
    SELECT reward_xp, reward_coins, is_claimed, current_progress, target
    INTO v_reward_xp, v_reward_coins, v_is_claimed, v_current, v_target
    FROM achievements
    WHERE id = p_quest_id AND character_id = p_character_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid quest type');
  END IF;

  -- Validate
  IF v_reward_xp IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest not found');
  END IF;
  IF v_is_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed');
  END IF;
  IF v_current < v_target THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest not completed');
  END IF;

  -- Mark as claimed
  IF p_quest_type = 'daily' THEN
    UPDATE daily_quests SET is_claimed = true WHERE id = p_quest_id;
  ELSE
    UPDATE achievements SET is_claimed = true, updated_at = now() WHERE id = p_quest_id;
  END IF;

  -- Award rewards via existing RPC
  PERFORM add_character_rewards(p_character_id, v_reward_xp, v_reward_coins);

  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', v_reward_xp,
    'coins_earned', v_reward_coins
  );
END;
$$;

GRANT EXECUTE ON FUNCTION claim_quest_reward(UUID, UUID, TEXT) TO authenticated;
