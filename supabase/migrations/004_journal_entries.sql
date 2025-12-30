-- =============================================================================
-- GrowGame - Journal Entries
-- =============================================================================
-- Migration: 004
-- Created: 2025-12-30
-- Description: Daily journal system with optional entries after habit completion
-- =============================================================================

-- =============================================================================
-- Create journal_entries table
-- =============================================================================

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  habit_log_id UUID REFERENCES habit_logs(id) ON DELETE CASCADE,
  entry_text TEXT NOT NULL CHECK (char_length(entry_text) <= 1000),
  mood TEXT CHECK (mood IN ('happy', 'neutral', 'tired', 'sad')),
  xp_earned INTEGER DEFAULT 5 CHECK (xp_earned >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- Create indexes
-- =============================================================================

CREATE INDEX idx_journal_entries_character_id ON journal_entries(character_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_habit_log_id ON journal_entries(habit_log_id);

-- =============================================================================
-- Enable Row Level Security
-- =============================================================================

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies
-- =============================================================================

-- Users can view their own journal entries
CREATE POLICY "Users can view their own journal entries"
ON journal_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = journal_entries.character_id
      AND characters.user_id = auth.uid()
  )
);

-- Users can insert their own journal entries
CREATE POLICY "Users can insert their own journal entries"
ON journal_entries
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = journal_entries.character_id
      AND characters.user_id = auth.uid()
  )
);

-- Users can update their own journal entries (within 24h)
CREATE POLICY "Users can update their own journal entries"
ON journal_entries
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = journal_entries.character_id
      AND characters.user_id = auth.uid()
  )
  AND created_at > NOW() - INTERVAL '24 hours'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = journal_entries.character_id
      AND characters.user_id = auth.uid()
  )
);

-- Users can delete their own journal entries (within 24h)
CREATE POLICY "Users can delete their own journal entries"
ON journal_entries
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = journal_entries.character_id
      AND characters.user_id = auth.uid()
  )
  AND created_at > NOW() - INTERVAL '24 hours'
);

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE journal_entries IS 'Daily journal entries linked to habit completions';
COMMENT ON COLUMN journal_entries.entry_text IS 'Journal entry content (max 1000 chars)';
COMMENT ON COLUMN journal_entries.habit_log_id IS 'Optional link to the habit log that prompted this entry';
COMMENT ON COLUMN journal_entries.mood IS 'Optional mood at time of writing';
COMMENT ON COLUMN journal_entries.xp_earned IS 'XP bonus for writing the journal (default 5)';
