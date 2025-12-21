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
  userId: string;
  name: string;
  globalLevel: number;
  globalXp: number;
  coins: number;
  gems: number;
  mood: Mood;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface DomainSkill {
  id: string;
  characterId: string;
  domain: Domain;
  level: number;
  xp: number;
  lastActivityAt: string | null;
}

// =============================================================================
// HABITUDES
// =============================================================================

export type Difficulty = 1 | 2 | 3;

export interface Habit {
  id: string;
  characterId: string;
  domain: Domain;
  name: string;
  difficulty: Difficulty;
  isActive: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  photoUrl: string | null;
  verified: boolean;
  xpEarned: number;
  coinsEarned: number;
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
  completedToday: boolean;
  todayLog: HabitLog | null;
}
