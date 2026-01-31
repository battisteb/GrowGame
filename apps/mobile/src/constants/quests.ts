/**
 * Quest Templates & Achievement Definitions
 *
 * Daily quests are generated semi-randomly from templates.
 * Achievements are permanent progression milestones.
 */

import type { Domain } from '../types';
import { DOMAINS } from '../types';
import { DOMAIN_INFO } from './game';

// =============================================================================
// UTILS
// =============================================================================

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// =============================================================================
// DAILY QUEST TEMPLATES
// =============================================================================

export type DailyQuestTemplateId =
  | 'complete_n_habits'
  | 'complete_habit_in_domain'
  | 'complete_difficulty_n'
  | 'write_journal'
  | 'complete_ranked_habit';

export interface DailyQuestTemplate {
  id: DailyQuestTemplateId;
  emoji: string;
  titleFn: (params: Record<string, unknown>) => string;
  descriptionFn: (params: Record<string, unknown>) => string;
  generate: () => { params: Record<string, unknown>; target: number };
  rewardXp: number;
  rewardCoins: number;
}

export const DAILY_QUEST_TEMPLATES: DailyQuestTemplate[] = [
  {
    id: 'complete_n_habits',
    emoji: '✅',
    titleFn: (p) => `Compléter ${p.n} habitude${(p.n as number) > 1 ? 's' : ''}`,
    descriptionFn: (p) => `Complète ${p.n} habitude(s) aujourd'hui`,
    generate: () => {
      const n = randomPick([1, 2, 3]);
      return { params: { n }, target: n };
    },
    rewardXp: 15,
    rewardCoins: 3,
  },
  {
    id: 'complete_habit_in_domain',
    emoji: '🎯',
    titleFn: (p) => `Habitude de ${DOMAIN_INFO[p.domain as Domain].name}`,
    descriptionFn: (p) =>
      `Complète 1 habitude dans le domaine ${DOMAIN_INFO[p.domain as Domain].name}`,
    generate: () => {
      const domain = randomPick([...DOMAINS]);
      return { params: { domain }, target: 1 };
    },
    rewardXp: 10,
    rewardCoins: 2,
  },
  {
    id: 'complete_difficulty_n',
    emoji: '💪',
    titleFn: (p) => `Habitude difficulté ${p.difficulty}`,
    descriptionFn: (p) =>
      `Complète une habitude de difficulté ${'⭐'.repeat(p.difficulty as number)}`,
    generate: () => {
      const difficulty = randomPick([1, 2, 3]);
      return { params: { difficulty }, target: 1 };
    },
    rewardXp: 15,
    rewardCoins: 3,
  },
  {
    id: 'write_journal',
    emoji: '📝',
    titleFn: () => 'Écrire dans le journal',
    descriptionFn: () => "Écris une entrée dans ton journal aujourd'hui",
    generate: () => ({ params: {}, target: 1 }),
    rewardXp: 10,
    rewardCoins: 2,
  },
  {
    id: 'complete_ranked_habit',
    emoji: '🏆',
    titleFn: () => 'Habitude en mode Ranked',
    descriptionFn: () => 'Complète une habitude en mode ranked avec photo',
    generate: () => ({ params: {}, target: 1 }),
    rewardXp: 20,
    rewardCoins: 5,
  },
];

/** Pick 3 unique random templates and generate daily quests */
export function generateDailyQuestSet(): Array<{
  templateId: DailyQuestTemplateId;
  params: Record<string, unknown>;
  target: number;
  rewardXp: number;
  rewardCoins: number;
}> {
  // Shuffle templates and pick 3
  const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  return selected.map((template) => {
    const { params, target } = template.generate();
    return {
      templateId: template.id,
      params,
      target,
      rewardXp: template.rewardXp,
      rewardCoins: template.rewardCoins,
    };
  });
}

/** Get template by ID */
export function getDailyQuestTemplate(
  templateId: string
): DailyQuestTemplate | undefined {
  return DAILY_QUEST_TEMPLATES.find((t) => t.id === templateId);
}

// =============================================================================
// ACHIEVEMENT DEFINITIONS
// =============================================================================

export type AchievementCategory =
  | 'level'
  | 'streak'
  | 'habits'
  | 'domain'
  | 'ranked'
  | 'coins';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  target: number;
  rewardXp: number;
  rewardCoins: number;
  category: AchievementCategory;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Level milestones
  {
    id: 'reach_level_5',
    title: 'Apprenti',
    description: 'Atteindre le niveau 5',
    emoji: '⭐',
    target: 5,
    rewardXp: 50,
    rewardCoins: 20,
    category: 'level',
  },
  {
    id: 'reach_level_10',
    title: 'Aventurier',
    description: 'Atteindre le niveau 10',
    emoji: '🌟',
    target: 10,
    rewardXp: 100,
    rewardCoins: 50,
    category: 'level',
  },
  {
    id: 'reach_level_25',
    title: 'Héros',
    description: 'Atteindre le niveau 25',
    emoji: '💫',
    target: 25,
    rewardXp: 250,
    rewardCoins: 100,
    category: 'level',
  },

  // Streak milestones
  {
    id: 'streak_7',
    title: 'Première Semaine',
    description: 'Streak de 7 jours',
    emoji: '🔥',
    target: 7,
    rewardXp: 30,
    rewardCoins: 10,
    category: 'streak',
  },
  {
    id: 'streak_30',
    title: 'Un Mois !',
    description: 'Streak de 30 jours',
    emoji: '🔥',
    target: 30,
    rewardXp: 100,
    rewardCoins: 50,
    category: 'streak',
  },

  // Total habits completed
  {
    id: 'habits_10',
    title: 'Début',
    description: 'Compléter 10 habitudes',
    emoji: '📋',
    target: 10,
    rewardXp: 20,
    rewardCoins: 5,
    category: 'habits',
  },
  {
    id: 'habits_50',
    title: 'Régulier',
    description: 'Compléter 50 habitudes',
    emoji: '📋',
    target: 50,
    rewardXp: 50,
    rewardCoins: 20,
    category: 'habits',
  },
  {
    id: 'habits_100',
    title: 'Habitué',
    description: 'Compléter 100 habitudes',
    emoji: '📋',
    target: 100,
    rewardXp: 100,
    rewardCoins: 50,
    category: 'habits',
  },

  // Domain mastery
  {
    id: 'all_domains_3',
    title: 'Polyvalent',
    description: 'Niveau 3 dans tous les domaines',
    emoji: '🎓',
    target: 5, // 5 domains must reach level 3
    rewardXp: 75,
    rewardCoins: 30,
    category: 'domain',
  },

  // Ranked
  {
    id: 'ranked_10',
    title: 'Compétiteur',
    description: 'Compléter 10 habitudes en ranked',
    emoji: '🏆',
    target: 10,
    rewardXp: 50,
    rewardCoins: 20,
    category: 'ranked',
  },

  // Coins earned
  {
    id: 'coins_100',
    title: 'Épargnant',
    description: 'Accumuler 100 pièces',
    emoji: '💰',
    target: 100,
    rewardXp: 30,
    rewardCoins: 10,
    category: 'coins',
  },
];

/** Get achievement definition by ID */
export function getAchievementDefinition(
  achievementId: string
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
}

/** Achievement category labels */
export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  level: 'Niveau',
  streak: 'Streak',
  habits: 'Habitudes',
  domain: 'Domaines',
  ranked: 'Ranked',
  coins: 'Pièces',
};
