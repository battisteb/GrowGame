-- =============================================================================
-- GrowGame - Initial Database Schema
-- =============================================================================
-- Migration: 001
-- Created: 2025-12-21
-- Description: Create core tables for characters, skills, habits, and shop
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CHARACTERS TABLE
-- =============================================================================

CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  global_level INTEGER DEFAULT 1 CHECK (global_level >= 1),
  global_xp INTEGER DEFAULT 0 CHECK (global_xp >= 0),
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  gems INTEGER DEFAULT 0 CHECK (gems >= 0),
  mood TEXT DEFAULT 'neutral' CHECK (mood IN ('happy', 'neutral', 'tired', 'sad')),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Un seul personnage par utilisateur
  UNIQUE(user_id)
);

-- Index pour recherches fréquentes
CREATE INDEX idx_characters_user_id ON characters(user_id);

-- =============================================================================
-- DOMAIN SKILLS TABLE
-- =============================================================================

CREATE TABLE domain_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('etudes', 'sport', 'meditation', 'lecture', 'etirements')),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Un seul skill par domaine par personnage
  UNIQUE(character_id, domain)
);

-- Index pour recherches par personnage
CREATE INDEX idx_domain_skills_character_id ON domain_skills(character_id);

-- =============================================================================
-- HABITS TABLE
-- =============================================================================

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('etudes', 'sport', 'meditation', 'lecture', 'etirements')),
  name TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherches par personnage et statut
CREATE INDEX idx_habits_character_id ON habits(character_id);
CREATE INDEX idx_habits_is_active ON habits(is_active) WHERE is_active = true;

-- =============================================================================
-- HABIT LOGS TABLE
-- =============================================================================

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  photo_url TEXT,
  verified BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
  coins_earned INTEGER DEFAULT 0 CHECK (coins_earned >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherches par habitude et date
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_completed_at ON habit_logs(completed_at DESC);

-- =============================================================================
-- SHOP ITEMS TABLE
-- =============================================================================

CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('cosmetic', 'decoration', 'joker')),
  slot TEXT CHECK (slot IN ('couvre_chef', 'haut', 'bas', 'chaussures', 'accessoire')),
  price_coins INTEGER DEFAULT 0 CHECK (price_coins >= 0),
  price_gems INTEGER DEFAULT 0 CHECK (price_gems >= 0),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  image_url TEXT,
  unlock_condition JSONB,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherches par type et rareté
CREATE INDEX idx_shop_items_type ON shop_items(type);
CREATE INDEX idx_shop_items_rarity ON shop_items(rarity);
CREATE INDEX idx_shop_items_is_available ON shop_items(is_available) WHERE is_available = true;

-- =============================================================================
-- USER ITEMS TABLE
-- =============================================================================

CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE NOT NULL,
  acquired_at TIMESTAMPTZ DEFAULT now(),

  -- Pas de doublons
  UNIQUE(user_id, item_id)
);

-- Index pour recherches par utilisateur
CREATE INDEX idx_user_items_user_id ON user_items(user_id);

-- =============================================================================
-- EQUIPMENTS TABLE
-- =============================================================================

CREATE TABLE equipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('couvre_chef', 'haut', 'bas', 'chaussures', 'accessoire')),
  item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  equipped_at TIMESTAMPTZ DEFAULT now(),

  -- Un seul item par slot par personnage
  UNIQUE(character_id, slot)
);

-- Index pour recherches par personnage
CREATE INDEX idx_equipments_character_id ON equipments(character_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;

-- Policies pour CHARACTERS
CREATE POLICY "Users can view their own character"
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own character"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own character"
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies pour DOMAIN_SKILLS
CREATE POLICY "Users can view their own domain skills"
  ON domain_skills FOR SELECT
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own domain skills"
  ON domain_skills FOR INSERT
  WITH CHECK (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own domain skills"
  ON domain_skills FOR UPDATE
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

-- Policies pour HABITS
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own habits"
  ON habits FOR ALL
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

-- Policies pour HABIT_LOGS
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING (
    habit_id IN (
      SELECT h.id FROM habits h
      JOIN characters c ON h.character_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (
    habit_id IN (
      SELECT h.id FROM habits h
      JOIN characters c ON h.character_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Policies pour USER_ITEMS
CREATE POLICY "Users can view their own items"
  ON user_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can acquire items"
  ON user_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour EQUIPMENTS
CREATE POLICY "Users can view their own equipment"
  ON equipments FOR SELECT
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own equipment"
  ON equipments FOR ALL
  USING (
    character_id IN (
      SELECT id FROM characters WHERE user_id = auth.uid()
    )
  );

-- Shop items sont publics (lecture seule)
CREATE POLICY "Anyone can view available shop items"
  ON shop_items FOR SELECT
  USING (is_available = true);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables avec updated_at
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_skills_updated_at
  BEFORE UPDATE ON domain_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL DATA (Optional shop items for testing)
-- =============================================================================

-- Quelques items de base pour tester
INSERT INTO shop_items (name, description, type, slot, price_coins, rarity) VALUES
  ('Casquette Basique', 'Une simple casquette', 'cosmetic', 'couvre_chef', 50, 'common'),
  ('T-shirt Blanc', 'Un t-shirt tout simple', 'cosmetic', 'haut', 50, 'common'),
  ('Jean Classique', 'Un jean confortable', 'cosmetic', 'bas', 50, 'common'),
  ('Baskets Simples', 'Des baskets pour tous les jours', 'cosmetic', 'chaussures', 50, 'common'),
  ('Lunettes Cool', 'Des lunettes stylées', 'cosmetic', 'accessoire', 100, 'rare'),
  ('Trophée Bronze', 'Votre premier trophée', 'decoration', NULL, 150, 'common'),
  ('Joker 1 Jour', 'Permet de sauter un jour sans casser le streak', 'joker', NULL, 500, 'epic');

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
