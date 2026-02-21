import {
  xpForLevel,
  levelFromXp,
  xpProgress,
  XP_REWARDS,
  COIN_REWARDS,
  RANKED_XP_REWARDS,
  JOURNAL_XP_REWARD,
  DECAY_THRESHOLD_DAYS,
  calculateDecayLevel,
  STREAK_7_DAYS_BONUS,
} from '../../constants/game';

describe('game constants', () => {
  describe('xpForLevel', () => {
    it('should calculate XP correctly for level 1', () => {
      // Formula: 100 * 1^2 / 2 = 50
      expect(xpForLevel(1)).toBe(50);
    });

    it('should calculate XP correctly for level 2', () => {
      // Formula: 100 * 2^2 / 2 = 200
      expect(xpForLevel(2)).toBe(200);
    });

    it('should calculate XP correctly for level 5', () => {
      // Formula: 100 * 5^2 / 2 = 1250
      expect(xpForLevel(5)).toBe(1250);
    });

    it('should calculate XP correctly for level 10', () => {
      // Formula: 100 * 10^2 / 2 = 5000
      expect(xpForLevel(10)).toBe(5000);
    });

    it('should return 0 for level 0', () => {
      expect(xpForLevel(0)).toBe(0);
    });

    it('should handle high levels', () => {
      // Formula: 100 * 50^2 / 2 = 125000
      expect(xpForLevel(50)).toBe(125000);
    });
  });

  describe('levelFromXp', () => {
    it('should return level 0 for 0 XP', () => {
      expect(levelFromXp(0)).toBe(0);
    });

    it('should return level 1 for 50 XP (exact threshold)', () => {
      expect(levelFromXp(50)).toBe(1);
    });

    it('should return level 1 for 100 XP (between level 1 and 2)', () => {
      expect(levelFromXp(100)).toBe(1);
    });

    it('should return level 2 for 200 XP (exact threshold)', () => {
      expect(levelFromXp(200)).toBe(2);
    });

    it('should return level 5 for 1250 XP', () => {
      expect(levelFromXp(1250)).toBe(5);
    });

    it('should return level 10 for 5000 XP', () => {
      expect(levelFromXp(5000)).toBe(10);
    });

    it('should return floor level for XP between levels', () => {
      // Between level 2 (200) and level 3 (450)
      expect(levelFromXp(300)).toBe(2);
    });

    it('should return correct level for 49 XP (just under level 1)', () => {
      expect(levelFromXp(49)).toBe(0);
    });
  });

  describe('xpProgress', () => {
    it('should calculate progress at level 0', () => {
      const progress = xpProgress(30); // 30 XP total

      expect(progress.level).toBe(0);
      expect(progress.current).toBe(30); // 30 - 0 (xpForLevel(0))
      expect(progress.required).toBe(50); // xpForLevel(1) - xpForLevel(0) = 50 - 0
    });

    it('should calculate progress within level 1', () => {
      const progress = xpProgress(75); // 75 XP total

      expect(progress.level).toBe(1);
      expect(progress.current).toBe(25); // 75 - 50 (xpForLevel(1))
      expect(progress.required).toBe(150); // xpForLevel(2) - xpForLevel(1) = 200 - 50
    });

    it('should handle exact level boundaries', () => {
      const progress = xpProgress(200); // Exactly level 2

      expect(progress.level).toBe(2);
      expect(progress.current).toBe(0); // At exact boundary
      expect(progress.required).toBe(250); // xpForLevel(3) - xpForLevel(2) = 450 - 200
    });

    it('should calculate progress at level 5', () => {
      const progress = xpProgress(1300); // 50 XP into level 5

      expect(progress.level).toBe(5);
      expect(progress.current).toBe(50); // 1300 - 1250 (xpForLevel(5))
      expect(progress.required).toBe(550); // xpForLevel(6) - xpForLevel(5) = 1800 - 1250
    });
  });

  describe('XP_REWARDS', () => {
    it('should have correct XP for difficulty 1', () => {
      expect(XP_REWARDS[1]).toBe(10);
    });

    it('should have correct XP for difficulty 2', () => {
      expect(XP_REWARDS[2]).toBe(20);
    });

    it('should have correct XP for difficulty 3', () => {
      expect(XP_REWARDS[3]).toBe(30);
    });
  });

  describe('COIN_REWARDS', () => {
    it('should have correct coins for difficulty 1', () => {
      expect(COIN_REWARDS[1]).toBe(1);
    });

    it('should have correct coins for difficulty 2', () => {
      expect(COIN_REWARDS[2]).toBe(2);
    });

    it('should have correct coins for difficulty 3', () => {
      expect(COIN_REWARDS[3]).toBe(3);
    });
  });

  describe('RANKED_XP_REWARDS', () => {
    it('should have 1.5x multiplier for difficulty 1', () => {
      expect(RANKED_XP_REWARDS[1]).toBe(15); // 10 * 1.5
    });

    it('should have 1.5x multiplier for difficulty 2', () => {
      expect(RANKED_XP_REWARDS[2]).toBe(30); // 20 * 1.5
    });

    it('should have 1.5x multiplier for difficulty 3', () => {
      expect(RANKED_XP_REWARDS[3]).toBe(45); // 30 * 1.5
    });

    it('should be higher than normal XP rewards', () => {
      expect(RANKED_XP_REWARDS[1]).toBeGreaterThan(XP_REWARDS[1]);
      expect(RANKED_XP_REWARDS[2]).toBeGreaterThan(XP_REWARDS[2]);
      expect(RANKED_XP_REWARDS[3]).toBeGreaterThan(XP_REWARDS[3]);
    });
  });

  describe('Other constants', () => {
    it('should have correct JOURNAL_XP_REWARD', () => {
      expect(JOURNAL_XP_REWARD).toBe(5);
    });

    it('should have correct DECAY_THRESHOLD_DAYS', () => {
      expect(DECAY_THRESHOLD_DAYS).toBe(7);
    });

    it('should have correct STREAK_7_DAYS_BONUS', () => {
      expect(STREAK_7_DAYS_BONUS).toBe(10);
    });
  });

  describe('calculateDecayLevel', () => {
    it('should halve level (ceil) for even levels', () => {
      expect(calculateDecayLevel(6)).toBe(3); // ceil(6/2) = 3
      expect(calculateDecayLevel(10)).toBe(5); // ceil(10/2) = 5
    });

    it('should halve level (ceil) for odd levels', () => {
      expect(calculateDecayLevel(5)).toBe(3); // ceil(5/2) = 3
      expect(calculateDecayLevel(7)).toBe(4); // ceil(7/2) = 4
    });

    it('should never go below level 1', () => {
      expect(calculateDecayLevel(1)).toBe(1);
      expect(calculateDecayLevel(2)).toBe(1);
    });

    it('should handle level 3', () => {
      expect(calculateDecayLevel(3)).toBe(2); // ceil(3/2) = 2
    });

    it('should handle level 4', () => {
      expect(calculateDecayLevel(4)).toBe(2); // ceil(4/2) = 2
    });
  });
});
