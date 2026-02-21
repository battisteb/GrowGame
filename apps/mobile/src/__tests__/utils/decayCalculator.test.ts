import {
  calculateDecay,
  calculateDecayForAllDomains,
  getDecayMessage,
  getDecaySummaryMessage,
} from '../../utils/decayCalculator';
import { createMockDomainSkill, createAllDomainSkills, daysAgo } from '../fixtures/character.fixtures';

describe('decayCalculator', () => {
  describe('calculateDecay', () => {
    it('should not decay when never practiced', () => {
      const skill = createMockDomainSkill('etudes', { last_activity_at: null });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(false);
      expect(result.newLevel).toBe(skill.level);
      expect(result.daysInactive).toBe(0);
      expect(result.levelLost).toBe(0);
    });

    it('should not decay within 7 days of activity', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 5,
        last_activity_at: daysAgo(5),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(false);
      expect(result.newLevel).toBe(5);
      expect(result.daysInactive).toBe(5);
      expect(result.levelLost).toBe(0);
    });

    it('should not decay at exactly 6 days inactive', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 6,
        last_activity_at: daysAgo(6),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(false);
      expect(result.daysInactive).toBe(6);
    });

    it('should decay to half level after 7+ days', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 6,
        last_activity_at: daysAgo(8),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(true);
      expect(result.newLevel).toBe(3); // floor(6/2) = 3
      expect(result.levelLost).toBe(3);
      expect(result.daysInactive).toBe(8);
    });

    it('should decay at exactly 7 days inactive', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 8,
        last_activity_at: daysAgo(7),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(true);
      expect(result.newLevel).toBe(4); // floor(8/2) = 4
      expect(result.levelLost).toBe(4);
    });

    it('should floor odd levels when halving', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 5,
        last_activity_at: daysAgo(10),
      });
      const result = calculateDecay(skill);

      expect(result.newLevel).toBe(2); // floor(5/2) = 2
      expect(result.levelLost).toBe(3);
    });

    it('should never decay below level 1', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 1,
        last_activity_at: daysAgo(30),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(false); // No actual level lost
      expect(result.newLevel).toBe(1);
      expect(result.levelLost).toBe(0);
    });

    it('should decay level 2 to level 1', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 2,
        last_activity_at: daysAgo(10),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(true);
      expect(result.newLevel).toBe(1);
      expect(result.levelLost).toBe(1);
    });

    it('should decay level 3 to level 1', () => {
      const skill = createMockDomainSkill('etudes', {
        level: 3,
        last_activity_at: daysAgo(15),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(true);
      expect(result.newLevel).toBe(1); // floor(3/2) = 1
      expect(result.levelLost).toBe(2);
    });

    it('should handle high level decay correctly', () => {
      const skill = createMockDomainSkill('sport', {
        level: 20,
        last_activity_at: daysAgo(14),
      });
      const result = calculateDecay(skill);

      expect(result.shouldDecay).toBe(true);
      expect(result.newLevel).toBe(10);
      expect(result.levelLost).toBe(10);
    });
  });

  describe('calculateDecayForAllDomains', () => {
    it('should calculate decay for all domains', () => {
      const skills = createAllDomainSkills().map((skill, index) => ({
        ...skill,
        level: 4,
        // First two skills are decayed (8+ days), rest are active
        last_activity_at: index < 2 ? daysAgo(10) : daysAgo(3),
      }));

      const results = calculateDecayForAllDomains(skills);

      expect(results.size).toBe(5);
      expect(results.get('etudes')?.shouldDecay).toBe(true);
      expect(results.get('sport')?.shouldDecay).toBe(true);
      expect(results.get('meditation')?.shouldDecay).toBe(false);
      expect(results.get('lecture')?.shouldDecay).toBe(false);
      expect(results.get('etirements')?.shouldDecay).toBe(false);
    });

    it('should return empty map for empty skills array', () => {
      const results = calculateDecayForAllDomains([]);
      expect(results.size).toBe(0);
    });

    it('should handle all skills active', () => {
      const skills = createAllDomainSkills().map((skill) => ({
        ...skill,
        level: 5,
        last_activity_at: daysAgo(2),
      }));

      const results = calculateDecayForAllDomains(skills);

      for (const [, result] of results) {
        expect(result.shouldDecay).toBe(false);
      }
    });

    it('should handle all skills decayed', () => {
      const skills = createAllDomainSkills().map((skill) => ({
        ...skill,
        level: 6,
        last_activity_at: daysAgo(14),
      }));

      const results = calculateDecayForAllDomains(skills);

      for (const [, result] of results) {
        expect(result.shouldDecay).toBe(true);
        expect(result.newLevel).toBe(3);
      }
    });
  });

  describe('getDecayMessage', () => {
    it('should return empty string when no decay', () => {
      const skill = createMockDomainSkill('etudes', { level: 5 });
      const result = { shouldDecay: false, newLevel: 5, daysInactive: 2, levelLost: 0 };

      expect(getDecayMessage(skill, result)).toBe('');
    });

    it('should return formatted message when decay occurs', () => {
      const skill = createMockDomainSkill('etudes', { level: 6 });
      const result = { shouldDecay: true, newLevel: 3, daysInactive: 10, levelLost: 3 };

      const message = getDecayMessage(skill, result);
      expect(message).toContain('Études');
      expect(message).toContain('6');
      expect(message).toContain('3');
      expect(message).toContain('10 jours');
    });

    it('should use correct domain name for sport', () => {
      const skill = createMockDomainSkill('sport', { level: 4 });
      const result = { shouldDecay: true, newLevel: 2, daysInactive: 8, levelLost: 2 };

      const message = getDecayMessage(skill, result);
      expect(message).toContain('Sport');
    });

    it('should use correct domain name for meditation', () => {
      const skill = createMockDomainSkill('meditation', { level: 4 });
      const result = { shouldDecay: true, newLevel: 2, daysInactive: 7, levelLost: 2 };

      const message = getDecayMessage(skill, result);
      expect(message).toContain('Méditation');
    });
  });

  describe('getDecaySummaryMessage', () => {
    it('should return null when no domains decayed', () => {
      const skills = createAllDomainSkills();
      const results = new Map([
        ['etudes', { shouldDecay: false, newLevel: 3, daysInactive: 2, levelLost: 0 }],
        ['sport', { shouldDecay: false, newLevel: 3, daysInactive: 3, levelLost: 0 }],
      ]);

      expect(getDecaySummaryMessage(skills, results)).toBeNull();
    });

    it('should return summary message when domains decayed', () => {
      const skills = createAllDomainSkills().map((s) => ({ ...s, level: 6 }));
      const results = new Map([
        ['etudes', { shouldDecay: true, newLevel: 3, daysInactive: 10, levelLost: 3 }],
        ['sport', { shouldDecay: false, newLevel: 6, daysInactive: 3, levelLost: 0 }],
        ['meditation', { shouldDecay: true, newLevel: 3, daysInactive: 8, levelLost: 3 }],
        ['lecture', { shouldDecay: false, newLevel: 6, daysInactive: 2, levelLost: 0 }],
        ['etirements', { shouldDecay: false, newLevel: 6, daysInactive: 1, levelLost: 0 }],
      ]);

      const message = getDecaySummaryMessage(skills, results);
      expect(message).not.toBeNull();
      expect(message).toContain('2 compétence(s)');
      expect(message).toContain('Études');
      expect(message).toContain('Méditation');
    });

    it('should handle single domain decay', () => {
      const skills = createAllDomainSkills().map((s) => ({ ...s, level: 4 }));
      const results = new Map([
        ['etudes', { shouldDecay: true, newLevel: 2, daysInactive: 9, levelLost: 2 }],
        ['sport', { shouldDecay: false, newLevel: 4, daysInactive: 3, levelLost: 0 }],
        ['meditation', { shouldDecay: false, newLevel: 4, daysInactive: 2, levelLost: 0 }],
        ['lecture', { shouldDecay: false, newLevel: 4, daysInactive: 1, levelLost: 0 }],
        ['etirements', { shouldDecay: false, newLevel: 4, daysInactive: 0, levelLost: 0 }],
      ]);

      const message = getDecaySummaryMessage(skills, results);
      expect(message).toContain('1 compétence(s)');
    });
  });
});
