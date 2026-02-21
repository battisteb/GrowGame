import type { Character, DomainSkill, Domain, Mood } from '../../types';

export const createMockCharacter = (overrides?: Partial<Character>): Character => ({
  id: 'char-123',
  user_id: 'user-456',
  name: 'TestPlayer',
  global_level: 5,
  global_xp: 500,
  ranked_level: 2,
  ranked_xp: 100,
  coins: 150,
  gems: 10,
  mood: 'neutral' as Mood,
  current_streak: 3,
  longest_streak: 7,
  last_activity_date: new Date().toISOString().split('T')[0],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockDomainSkill = (
  domain: Domain,
  overrides?: Partial<DomainSkill>
): DomainSkill => ({
  id: `skill-${domain}`,
  character_id: 'char-123',
  domain,
  level: 3,
  xp: 200,
  last_activity_at: new Date().toISOString(),
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createAllDomainSkills = (characterId: string = 'char-123'): DomainSkill[] => {
  const domains: Domain[] = ['etudes', 'sport', 'meditation', 'lecture', 'etirements'];
  return domains.map((domain) => createMockDomainSkill(domain, { character_id: characterId }));
};

/**
 * Helper to create a date string for X days ago
 */
export const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};
