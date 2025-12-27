/**
 * Decay Calculator
 *
 * Calculates skill decay for inactive domains
 * - After 7 days of inactivity, skill level decreases
 * - Minimum level = currentLevel / 2 (or 1)
 * - Encourages regular practice across all domains
 */

import type { DomainSkill } from '../types';

export interface DecayResult {
  shouldDecay: boolean;
  newLevel: number;
  daysInactive: number;
  levelLost: number;
}

const DECAY_THRESHOLD_DAYS = 7;

/**
 * Calculate if a domain skill should decay and by how much
 *
 * Rules:
 * - No decay if last_activity_at is within 7 days
 * - After 7+ days: level drops to max(1, currentLevel / 2)
 * - Never goes below level 1
 *
 * @param domainSkill - The domain skill to check
 * @param currentDate - Current date for calculation (defaults to now)
 */
export function calculateDecay(
  domainSkill: DomainSkill,
  currentDate: Date = new Date()
): DecayResult {
  // If never practiced, no decay (starts at level 1)
  if (!domainSkill.last_activity_at) {
    return {
      shouldDecay: false,
      newLevel: domainSkill.level,
      daysInactive: 0,
      levelLost: 0,
    };
  }

  const lastActivity = new Date(domainSkill.last_activity_at);
  lastActivity.setHours(0, 0, 0, 0);

  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  const daysInactive = Math.floor(
    (current.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  // No decay if within threshold
  if (daysInactive < DECAY_THRESHOLD_DAYS) {
    return {
      shouldDecay: false,
      newLevel: domainSkill.level,
      daysInactive,
      levelLost: 0,
    };
  }

  // Apply decay: level drops to half (minimum 1)
  const currentLevel = domainSkill.level;
  const newLevel = Math.max(1, Math.floor(currentLevel / 2));
  const levelLost = currentLevel - newLevel;

  return {
    shouldDecay: levelLost > 0, // Only decay if actually losing levels
    newLevel,
    daysInactive,
    levelLost,
  };
}

/**
 * Calculate decay for all domain skills
 * Returns an array of results, one per domain
 */
export function calculateDecayForAllDomains(
  domainSkills: DomainSkill[],
  currentDate: Date = new Date()
): Map<string, DecayResult> {
  const results = new Map<string, DecayResult>();

  for (const skill of domainSkills) {
    const result = calculateDecay(skill, currentDate);
    results.set(skill.domain, result);
  }

  return results;
}

/**
 * Get a human-readable message for decay
 */
export function getDecayMessage(domainSkill: DomainSkill, result: DecayResult): string {
  if (!result.shouldDecay) return '';

  const domainNames: { [key: string]: string } = {
    etudes: 'Études',
    sport: 'Sport',
    meditation: 'Méditation',
    lecture: 'Lecture',
    etirements: 'Étirements',
  };

  const domainName = domainNames[domainSkill.domain] || domainSkill.domain;

  return `⚠️ ${domainName} : Niveau ${domainSkill.level} → ${result.newLevel} (${result.daysInactive} jours sans pratique)`;
}

/**
 * Get a summary message for multiple decays
 */
export function getDecaySummaryMessage(
  domainSkills: DomainSkill[],
  decayResults: Map<string, DecayResult>
): string | null {
  const decayedDomains = domainSkills.filter((skill) => {
    const result = decayResults.get(skill.domain);
    return result && result.shouldDecay;
  });

  if (decayedDomains.length === 0) return null;

  const messages = decayedDomains.map((skill) => {
    const result = decayResults.get(skill.domain)!;
    return getDecayMessage(skill, result);
  });

  const header = `📉 ${decayedDomains.length} compétence(s) ont décliné par manque de pratique :\n\n`;

  return header + messages.join('\n') + '\n\nContinue à pratiquer régulièrement pour maintenir tes niveaux !';
}
