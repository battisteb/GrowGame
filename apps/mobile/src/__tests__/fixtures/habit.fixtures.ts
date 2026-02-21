import type { Habit, HabitLog, Domain, Difficulty, CompletionMode } from '../../types';

export const createMockHabit = (overrides?: Partial<Habit>): Habit => ({
  id: 'habit-123',
  character_id: 'char-123',
  domain: 'etudes' as Domain,
  name: 'Study French',
  difficulty: 2 as Difficulty,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockHabitLog = (overrides?: Partial<HabitLog>): HabitLog => ({
  id: 'log-123',
  habit_id: 'habit-123',
  completed_at: new Date().toISOString(),
  photo_url: null,
  verified: true,
  completion_mode: 'normal' as CompletionMode,
  xp_earned: 20,
  coins_earned: 2,
  created_at: new Date().toISOString(),
  ...overrides,
});
