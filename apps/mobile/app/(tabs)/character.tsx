import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DOMAINS = [
  { id: 'etudes', name: 'Études', emoji: '📖', level: 1, xp: 30, maxXp: 50 },
  { id: 'sport', name: 'Sport', emoji: '💪', level: 2, xp: 80, maxXp: 200 },
  { id: 'meditation', name: 'Méditation', emoji: '🧘', level: 1, xp: 10, maxXp: 50 },
  { id: 'lecture', name: 'Lecture', emoji: '📚', level: 3, xp: 150, maxXp: 450 },
  { id: 'etirements', name: 'Étirements', emoji: '🤸', level: 1, xp: 0, maxXp: 50 },
];

export default function CharacterScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Character Avatar Placeholder */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🧑‍🎓</Text>
          </View>
          <Text style={styles.characterName}>Aventurier</Text>
          <Text style={styles.mood}>Humeur: Motivé 😊</Text>
        </View>

        {/* Global Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Statistiques Globales</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Niveau</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1,250</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Pièces</Text>
            </View>
          </View>
        </View>

        {/* Domain Skills */}
        <View style={styles.skillsCard}>
          <Text style={styles.sectionTitle}>Compétences par Domaine</Text>
          {DOMAINS.map((domain) => (
            <View key={domain.id} style={styles.skillRow}>
              <Text style={styles.skillEmoji}>{domain.emoji}</Text>
              <View style={styles.skillInfo}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillName}>{domain.name}</Text>
                  <Text style={styles.skillLevel}>Niv. {domain.level}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(domain.xp / domain.maxXp) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.xpText}>
                  {domain.xp} / {domain.maxXp} XP
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mood: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  skillsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  skillLevel: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
});
