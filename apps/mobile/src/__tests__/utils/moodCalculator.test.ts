import { calculateMood, getMoodDescription } from '../../utils/moodCalculator';
import { daysAgo } from '../fixtures/character.fixtures';

describe('moodCalculator', () => {
  describe('calculateMood', () => {
    it('should return sad when 3+ days inactive', () => {
      const result = calculateMood({
        currentStreak: 0,
        lastActivityDate: daysAgo(5),
      });

      expect(result.mood).toBe('sad');
      expect(result.reason).toContain('5 jours');
    });

    it('should return sad when exactly 3 days inactive', () => {
      const result = calculateMood({
        currentStreak: 0,
        lastActivityDate: daysAgo(3),
      });

      expect(result.mood).toBe('sad');
      expect(result.reason).toContain('3 jours');
    });

    it('should return tired when 2 days inactive', () => {
      const result = calculateMood({
        currentStreak: 0,
        lastActivityDate: daysAgo(2),
      });

      expect(result.mood).toBe('tired');
      expect(result.reason).toContain('2 jours');
    });

    it('should return happy when streak >= 7 and active today', () => {
      const result = calculateMood({
        currentStreak: 10,
        lastActivityDate: daysAgo(0),
      });

      expect(result.mood).toBe('happy');
      expect(result.reason).toContain('10 jours');
    });

    it('should return happy when streak >= 7 and active yesterday', () => {
      const result = calculateMood({
        currentStreak: 7,
        lastActivityDate: daysAgo(1),
      });

      expect(result.mood).toBe('happy');
      expect(result.reason).toContain('7 jours');
    });

    it('should return neutral when active today but low streak', () => {
      const result = calculateMood({
        currentStreak: 3,
        lastActivityDate: daysAgo(0),
      });

      expect(result.mood).toBe('neutral');
      expect(result.reason).toContain('régulière');
    });

    it('should return neutral when active yesterday but low streak', () => {
      const result = calculateMood({
        currentStreak: 5,
        lastActivityDate: daysAgo(1),
      });

      expect(result.mood).toBe('neutral');
      expect(result.reason).toContain('progression');
    });

    it('should prioritize sad over happy even with high streak', () => {
      const result = calculateMood({
        currentStreak: 10, // High streak but...
        lastActivityDate: daysAgo(4), // ...4 days inactive
      });

      expect(result.mood).toBe('sad');
    });

    it('should prioritize tired over happy when 2 days inactive', () => {
      const result = calculateMood({
        currentStreak: 15,
        lastActivityDate: daysAgo(2),
      });

      expect(result.mood).toBe('tired');
    });

    it('should handle null lastActivityDate as infinite days (sad)', () => {
      const result = calculateMood({
        currentStreak: 0,
        lastActivityDate: null,
      });

      expect(result.mood).toBe('sad');
    });

    it('should return neutral for streak of 6 with recent activity', () => {
      const result = calculateMood({
        currentStreak: 6,
        lastActivityDate: daysAgo(0),
      });

      expect(result.mood).toBe('neutral');
    });

    it('should return happy for exactly 7 streak with activity today', () => {
      const result = calculateMood({
        currentStreak: 7,
        lastActivityDate: daysAgo(0),
      });

      expect(result.mood).toBe('happy');
    });
  });

  describe('getMoodDescription', () => {
    it('should return description for happy mood', () => {
      const description = getMoodDescription('happy');
      expect(description.toLowerCase()).toContain('heureux');
    });

    it('should return description for neutral mood', () => {
      const description = getMoodDescription('neutral');
      expect(description.toLowerCase()).toContain('concentré');
    });

    it('should return description for tired mood', () => {
      const description = getMoodDescription('tired');
      expect(description.toLowerCase()).toContain('fatigué');
    });

    it('should return description for sad mood', () => {
      const description = getMoodDescription('sad');
      expect(description.toLowerCase()).toContain('besoin');
    });

    it('should return non-empty string for all moods', () => {
      const moods = ['happy', 'neutral', 'tired', 'sad'] as const;
      for (const mood of moods) {
        const description = getMoodDescription(mood);
        expect(description.length).toBeGreaterThan(0);
      }
    });
  });
});
