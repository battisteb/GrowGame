/**
 * Domain Skill Card Component
 *
 * Displays a single domain skill with level and XP
 */

import { View, Text, StyleSheet } from 'react-native';
import type { DomainSkill, Domain } from '../types';
import { xpForLevel } from '../constants/game';

interface DomainSkillCardProps {
  skill: DomainSkill;
}

const DOMAIN_LABELS: Record<Domain, string> = {
  etudes: '📚 Études',
  sport: '💪 Sport',
  meditation: '🧘 Méditation',
  lecture: '📖 Lecture',
  etirements: '🤸 Étirements',
};

const DOMAIN_COLORS: Record<Domain, string> = {
  etudes: '#3b82f6',
  sport: '#ef4444',
  meditation: '#8b5cf6',
  lecture: '#f59e0b',
  etirements: '#10b981',
};

export function DomainSkillCard({ skill }: DomainSkillCardProps) {
  const xpNeeded = xpForLevel(skill.level + 1);
  const xpForCurrentLevel = xpForLevel(skill.level);
  const xpInThisLevel = skill.xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpNeeded - xpForCurrentLevel;
  const progress = Math.min((xpInThisLevel / xpNeededForNextLevel) * 100, 100);

  const domainColor = DOMAIN_COLORS[skill.domain];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.domainLabel}>{DOMAIN_LABELS[skill.domain]}</Text>
        <Text style={[styles.level, { color: domainColor }]}>
          Niv. {skill.level}
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%`, backgroundColor: domainColor },
            ]}
          />
        </View>
        <Text style={styles.xpText}>
          {xpInThisLevel} / {xpNeededForNextLevel} XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  level: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    gap: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'right',
  },
});
