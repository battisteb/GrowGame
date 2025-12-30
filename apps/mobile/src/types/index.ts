/**
 * Types principaux de l'application GrowGame
 */

// =============================================================================
// DOMAINES
// =============================================================================

export type Domain = 'etudes' | 'sport' | 'meditation' | 'lecture' | 'etirements';

export const DOMAINS: Domain[] = ['etudes', 'sport', 'meditation', 'lecture', 'etirements'];

export interface DomainInfo {
  id: Domain;
  name: string;
  emoji: string;
  color: string;
}

// =============================================================================
// PERSONNAGE
// =============================================================================

export type Mood = 'happy' | 'neutral' | 'tired' | 'sad';

export interface Character {
  id: string;
  user_id: string;
  name: string;
  global_level: number;
  global_xp: number;
  coins: number;
  gems: number;
  mood: Mood;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DomainSkill {
  id: string;
  character_id: string;
  domain: Domain;
  level: number;
  xp: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// HABITUDES
// =============================================================================

export type Difficulty = 1 | 2 | 3;

export interface Habit {
  id: string;
  character_id: string;
  domain: Domain;
  name: string;
  difficulty: Difficulty;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_at: string;
  photo_url: string | null;
  verified: boolean;
  xp_earned: number;
  coins_earned: number;
  created_at: string;
}

// =============================================================================
// BOUTIQUE
// =============================================================================

export type ItemType = 'cosmetic' | 'decoration' | 'joker';
export type EquipmentSlot = 'couvre_chef' | 'haut' | 'bas' | 'chaussures' | 'accessoire';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: ItemType;
  slot: EquipmentSlot | null;
  priceCoins: number;
  priceGems: number;
  rarity: Rarity;
  imageUrl: string | null;
  unlockCondition: Record<string, unknown> | null;
}

export interface UserItem {
  id: string;
  userId: string;
  itemId: string;
  acquiredAt: string;
}

export interface Equipment {
  id: string;
  characterId: string;
  slot: EquipmentSlot;
  itemId: string;
}

// =============================================================================
// UTILISATEUR
// =============================================================================

export interface User {
  id: string;
  email: string;
  createdAt: string;
  isPremium: boolean;
}

// =============================================================================
// ÉTAT DES HABITUDES DU JOUR
// =============================================================================

export interface TodayHabit extends Habit {
  completed_today: boolean;
  today_log: HabitLog | null;
}
