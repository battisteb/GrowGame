-- =============================================================================
-- GrowGame - Populate Shop Items
-- =============================================================================
-- Migration: 005
-- Created: 2025-12-30
-- Description: Add more shop items with variety in slots, rarities, and prices
-- =============================================================================

-- Note: Initial test items already exist from migration 001
-- This migration adds more variety for a complete shop experience

-- =============================================================================
-- Couvre-chef (Headwear)
-- =============================================================================

INSERT INTO shop_items (name, description, type, slot, price_coins, rarity) VALUES
  ('Béret Artistique', 'Pour les créatifs', 'cosmetic', 'couvre_chef', 120, 'rare'),
  ('Couronne Dorée', 'Pour les champions', 'cosmetic', 'couvre_chef', 500, 'epic'),
  ('Chapeau de Magicien', 'Mystérieux et élégant', 'cosmetic', 'couvre_chef', 300, 'rare'),
  ('Bandeau de Sport', 'Pour les athlètes', 'cosmetic', 'couvre_chef', 80, 'common'),
  ('Casque Spatial', 'Vers l''infini et au-delà', 'cosmetic', 'couvre_chef', 1000, 'legendary');

-- =============================================================================
-- Haut (Top)
-- =============================================================================

INSERT INTO shop_items (name, description, type, slot, price_coins, rarity) VALUES
  ('Hoodie Gamer', 'Confortable et stylé', 'cosmetic', 'haut', 150, 'rare'),
  ('Kimono Traditionnel', 'Élégance japonaise', 'cosmetic', 'haut', 400, 'epic'),
  ('T-shirt "Level Up"', 'Affiche ton niveau', 'cosmetic', 'haut', 100, 'common'),
  ('Veste en Cuir', 'Look rebelle', 'cosmetic', 'haut', 250, 'rare'),
  ('Armure de Chevalier', 'Protection maximale', 'cosmetic', 'haut', 800, 'legendary');

-- =============================================================================
-- Bas (Bottom)
-- =============================================================================

INSERT INTO shop_items (name, description, type, slot, price_coins, rarity) VALUES
  ('Short de Sport', 'Parfait pour l''entraînement', 'cosmetic', 'bas', 80, 'common'),
  ('Pantalon Cargo', 'Pratique et robuste', 'cosmetic', 'bas', 130, 'rare'),
  ('Jupe Plissée', 'Style académique', 'cosmetic', 'bas', 110, 'common'),
  ('Kimono Bas', 'Complète le haut', 'cosmetic', 'bas', 350, 'epic'),
  ('Pantalon Futuriste', 'Du futur', 'cosmetic', 'bas', 600, 'legendary');

-- =============================================================================
-- Chaussures (Shoes)
-- =============================================================================

INSERT INTO shop_items (name, description, type, slot, price_coins, rarity) VALUES
  ('Chaussures de Course', 'Pour aller plus vite', 'cosmetic', 'chaussures', 120, 'common'),
  ('Bottes de Combat', 'Robustes et stylées', 'cosmetic', 'chaussures', 200, 'rare'),
  ('Sandales Zen', 'Confort et sérénité', 'cosmetic', 'chaussures', 90, 'common'),
  ('Sneakers Lumineuses', 'Brille dans le noir', 'cosmetic', 'chaussures', 350, 'epic'),
  ('Bottes Volantes', 'Défie la gravité', 'cosmetic', 'chaussures', 900, 'legendary');

-- =============================================================================
-- Accessoires (Accessories)
-- =============================================================================

INSERT INTO shop_items (name, description, type, slot, price_coins, rarity) VALUES
  ('Écharpe Rayée', 'Pour les jours froids', 'cosmetic', 'accessoire', 70, 'common'),
  ('Collier Porte-Bonheur', 'Chance +10', 'cosmetic', 'accessoire', 150, 'rare'),
  ('Montre Intelligente', 'Toujours à l''heure', 'cosmetic', 'accessoire', 180, 'rare'),
  ('Cape de Héros', 'Tous les héros en ont une', 'cosmetic', 'accessoire', 450, 'epic'),
  ('Aura Dorée', 'Rayonne de prestige', 'cosmetic', 'accessoire', 1200, 'legendary');

-- =============================================================================
-- Décorations (Decorations)
-- =============================================================================

INSERT INTO shop_items (name, description, type, price_coins, rarity) VALUES
  ('Trophée Argent', 'Belle progression', 'decoration', 300, 'rare'),
  ('Trophée Or', 'Excellence reconnue', 'decoration', 600, 'epic'),
  ('Plante en Pot', 'Ambiance zen', 'decoration', 80, 'common'),
  ('Affiche Motivante', 'Never give up!', 'decoration', 100, 'common'),
  ('Statue de Champion', 'Monument à ta gloire', 'decoration', 1500, 'legendary'),
  ('Lampe Magique', 'Éclaire ton espace', 'decoration', 200, 'rare');

-- =============================================================================
-- Jokers (Special Items)
-- =============================================================================

INSERT INTO shop_items (name, description, type, price_coins, rarity) VALUES
  ('Joker 3 Jours', 'Protège ton streak 3 jours', 'joker', 1200, 'epic'),
  ('Joker 7 Jours', 'Une semaine de protection', 'joker', 2500, 'legendary'),
  ('Double XP', 'Double ton XP pendant 24h', 'joker', 800, 'epic');

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE shop_items IS 'Catalog of purchasable items for character customization';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
