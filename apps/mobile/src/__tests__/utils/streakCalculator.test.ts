import {
  calculateStreak,
  calculateStreakBonus,
  isStreakInDanger,
  formatStreak,
  getStreakMilestoneMessage,
} from '../../utils/streakCalculator';
import { daysAgo } from '../fixtures/character.fixtures';

describe('streakCalculator', () => {
  describe('calculateStreak', () => {
    it('should start streak at 1 when no previous activity', () => {
      const result = calculateStreak(null, 0, 0);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
      expect(result.shouldAwardBonus).toBe(false);
      expect(result.bonusAmount).toBe(0);
    });

    it('should maintain streak when activity was today', () => {
      const today = daysAgo(0);
      const result = calculateStreak(today, 5, 10);

      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(10);
      expect(result.shouldAwardBonus).toBe(false);
    });

    it('should start streak at 1 when current streak is 0 and activity is today', () => {
      const today = daysAgo(0);
      const result = calculateStreak(today, 0, 5);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(5);
    });

    it('should increment streak when last activity was yesterday', () => {
      const yesterday = daysAgo(1);
      const result = calculateStreak(yesterday, 5, 10);

      expect(result.currentStreak).toBe(6);
      expect(result.longestStreak).toBe(10);
    });

    it('should reset streak to 1 when gap > 1 day', () => {
      const twoDaysAgo = daysAgo(2);
      const result = calculateStreak(twoDaysAgo, 5, 10);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(10); // Longest preserved
    });

    it('should reset streak when activity was 7 days ago', () => {
      const sevenDaysAgo = daysAgo(7);
      const result = calculateStreak(sevenDaysAgo, 20, 20);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(20);
    });

    it('should update longest streak when current exceeds it', () => {
      const yesterday = daysAgo(1);
      const result = calculateStreak(yesterday, 10, 10);

      expect(result.currentStreak).toBe(11);
      expect(result.longestStreak).toBe(11);
    });

    it('should not update longest streak when current is less', () => {
      const yesterday = daysAgo(1);
      const result = calculateStreak(yesterday, 3, 15);

      expect(result.currentStreak).toBe(4);
      expect(result.longestStreak).toBe(15);
    });

    it('should award bonus at 7-day milestone', () => {
      const yesterday = daysAgo(1);
      const result = calculateStreak(yesterday, 6, 10);

      expect(result.currentStreak).toBe(7);
      expect(result.shouldAwardBonus).toBe(true);
      expect(result.bonusAmount).toBe(10);
    });

    it('should award bonus at 14-day milestone', () => {
      const yesterday = daysAgo(1);
      const result = calculateStreak(yesterday, 13, 20);

      expect(result.currentStreak).toBe(14);
      expect(result.shouldAwardBonus).toBe(true);
      expect(result.bonusAmount).toBe(25);
    });

    it('should award bonus at 30-day milestone', () => {
      const yesterday = daysAgo(1);
      const result = calculateStreak(yesterday, 29, 30);

      expect(result.currentStreak).toBe(30);
      expect(result.shouldAwardBonus).toBe(true);
      expect(result.bonusAmount).toBe(50);
    });

    it('should not award bonus for non-milestone streaks', () => {
      const yesterday = daysAgo(1);
      const result = calculateStreak(yesterday, 8, 10);

      expect(result.currentStreak).toBe(9);
      expect(result.shouldAwardBonus).toBe(false);
      expect(result.bonusAmount).toBe(0);
    });
  });

  describe('calculateStreakBonus', () => {
    it.each([
      [7, 10],
      [14, 25],
      [30, 50],
      [60, 100],
      [100, 200],
    ])('should return %i coins for %i-day streak', (streak, expectedBonus) => {
      expect(calculateStreakBonus(streak)).toBe(expectedBonus);
    });

    it.each([1, 2, 5, 8, 15, 25, 50, 99])(
      'should return 0 for non-milestone streak (%i days)',
      (streak) => {
        expect(calculateStreakBonus(streak)).toBe(0);
      }
    );
  });

  describe('isStreakInDanger', () => {
    it('should return false when no previous activity', () => {
      expect(isStreakInDanger(null)).toBe(false);
    });

    it('should return true when last activity was yesterday', () => {
      const yesterday = daysAgo(1);
      expect(isStreakInDanger(yesterday)).toBe(true);
    });

    it('should return false when activity was today', () => {
      const today = daysAgo(0);
      expect(isStreakInDanger(today)).toBe(false);
    });

    it('should return false when activity was 2+ days ago (streak already broken)', () => {
      const twoDaysAgo = daysAgo(2);
      expect(isStreakInDanger(twoDaysAgo)).toBe(false);
    });
  });

  describe('formatStreak', () => {
    it('should format zero streak', () => {
      expect(formatStreak(0)).toBe('Pas encore de série');
    });

    it('should format single day', () => {
      expect(formatStreak(1)).toBe('1 jour');
    });

    it('should format multiple days', () => {
      expect(formatStreak(7)).toBe('7 jours');
      expect(formatStreak(100)).toBe('100 jours');
    });
  });

  describe('getStreakMilestoneMessage', () => {
    it('should return message for 7-day milestone', () => {
      const message = getStreakMilestoneMessage(7);
      expect(message).toContain('7 jours');
    });

    it('should return message for 14-day milestone', () => {
      const message = getStreakMilestoneMessage(14);
      expect(message).toContain('2 semaines');
    });

    it('should return message for 30-day milestone', () => {
      const message = getStreakMilestoneMessage(30);
      expect(message).toContain('1 mois');
    });

    it('should return message for 60-day milestone', () => {
      const message = getStreakMilestoneMessage(60);
      expect(message).toContain('2 mois');
    });

    it('should return message for 100-day milestone', () => {
      const message = getStreakMilestoneMessage(100);
      expect(message).toContain('100 JOURS');
    });

    it('should return null for non-milestone streaks', () => {
      expect(getStreakMilestoneMessage(5)).toBeNull();
      expect(getStreakMilestoneMessage(15)).toBeNull();
      expect(getStreakMilestoneMessage(50)).toBeNull();
    });
  });
});
