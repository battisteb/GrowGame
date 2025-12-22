/**
 * Constantes et formules du jeu GrowGame
 */

import type { Domain, DomainInfo, Difficulty, Rarity } from '../types';

// =============================================================================
// DOMAINES
// =============================================================================

export const DOMAIN_INFO: Record<Domain, DomainInfo> = {
  etudes: {
    id: 'etudes',
    name: 'Études',
    emoji: '📖',
    color: '#3b82f6', // blue
  },
  sport: {
    id: 'sport',
    name: 'Sport',
    emoji: '💪',
    color: '#ef4444', // red
  },
  meditation: {
    id: 'meditation',
    name: 'Méditation',
    emoji: '🧘',
    color: '#8b5cf6', // violet
  },
  lecture: {
    id: 'lecture',
    name: 'Lecture',
    emoji: '📚',
    color: '#f59e0b', // amber
  },
  etirements: {
    id: 'etirements',
    name: 'Étirements',
    emoji: '🤸',
    color: '#10b981', // emerald
  },
};

// =============================================================================
// FORMULES XP
// =============================================================================

/**
 * Calcule l'XP requis pour atteindre un niveau donné
 * Formule: 100 × (niveau²) / 2
 */
export const xpForLevel = (level: number): number => {
  return Math.floor((100 * level ** 2) / 2);
};

/**
 * Calcule le niveau à partir de l'XP total
 */
export const levelFromXp = (xp: number): number => {
  // Inverse de la formule: niveau = sqrt(2 * xp / 100)
  return Math.floor(Math.sqrt((2 * xp) / 100));
};

/**
 * Calcule l'XP dans le niveau actuel et l'XP requis pour le prochain
 */
export const xpProgress = (
  totalXp: number
): { current: number; required: number; level: number } => {
  const level = levelFromXp(totalXp);
  const xpAtCurrentLevel = xpForLevel(level);
  const xpAtNextLevel = xpForLevel(level + 1);

  return {
    level,
    current: totalXp - xpAtCurrentLevel,
    required: xpAtNextLevel - xpAtCurrentLevel,
  };
};

// =============================================================================
// RÉCOMPENSES
// =============================================================================

/**
 * XP gagné par difficulté d'habitude
 */
export const XP_REWARDS: Record<Difficulty, number> = {
  1: 10,
  2: 20,
  3: 30,
};

/**
 * Pièces gagnées par difficulté d'habitude
 */
export const COIN_REWARDS: Record<Difficulty, number> = {
  1: 1,
  2: 2,
  3: 3,
};

/**
 * XP bonus pour le journal quotidien
 */
export const JOURNAL_XP_REWARD = 5;

/**
 * Pièces bonus pour un streak de 7 jours
 */
export const STREAK_7_DAYS_BONUS = 10;

// =============================================================================
// PUNITIONS
// =============================================================================

/**
 * XP perdu en cas d'échec d'habitude
 */
export const HABIT_FAILURE_XP_PENALTY = 5;

/**
 * Pièces perdues en cas d'échec d'habitude
 */
export const HABIT_FAILURE_COIN_PENALTY = 1;

/**
 * Nombre de jours consécutifs d'échec avant debuff visuel
 */
export const CONSECUTIVE_FAILURE_THRESHOLD = 3;

// =============================================================================
// DECAY (Décroissance)
// =============================================================================

/**
 * Nombre de jours d'inactivité avant le début du decay
 */
export const DECAY_THRESHOLD_DAYS = 7;

/**
 * Calcule le niveau minimum après decay
 * Le niveau ne descend jamais en dessous de la moitié du niveau au moment de l'arrêt
 */
export const calculateDecayLevel = (levelAtStop: number): number => {
  const minLevel = Math.ceil(levelAtStop / 2);
  return Math.max(1, minLevel);
};

// =============================================================================
// BOUTIQUE
// =============================================================================

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

/**
 * Prix indicatifs par rareté (en pièces)
 */
export const RARITY_BASE_PRICE: Record<Rarity, number> = {
  common: 100,
  rare: 300,
  epic: 500,
  legendary: 700,
};

// =============================================================================
// HUMEUR
// =============================================================================

export const MOOD_EMOJIS = {
  happy: '😊',
  neutral: '😐',
  tired: '😴',
} as const;

// =============================================================================
// NIVEAUX ET PROGRESSION
// =============================================================================

/**
 * Niveau maximum (peut être augmenté)
 */
export const MAX_LEVEL = 100;

/**
 * Niveau maximum gratuit
 */
export const FREE_MAX_LEVEL = 10;
