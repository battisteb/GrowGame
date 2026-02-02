import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useCharacterStore } from '../../src/stores/characterStore';
import { showAlert, showConfirmAlert } from '../../src/utils/alert';
import { XPProgressBar } from '../../src/components/XPProgressBar';
import { DomainSkillCard } from '../../src/components/DomainSkillCard';
import { MOOD_EMOJIS } from '../../src/constants/game';
import { getMoodDescription } from '../../src/utils/moodCalculator';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { character, domainSkills, isLoading, decayMessage, clearDecayMessage, notificationsEnabled, toggleNotifications } = useCharacterStore();

  // Display decay notification when skills have decayed
  useEffect(() => {
    if (decayMessage) {
      showAlert('Compétences en déclin', decayMessage, [
        {
          text: 'OK',
          onPress: () => clearDecayMessage(),
        },
      ]);
    }
  }, [decayMessage, clearDecayMessage]);

  const handleLogout = () => {
    showConfirmAlert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      async () => {
        await logout();
        router.replace('/login');
      }
    );
  };

  const userName = character?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Aventurier';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement de votre personnage...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!character) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Aucun personnage trouvé</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GrowGame</Text>
          <Text style={styles.subtitle}>Bienvenue, {userName} !</Text>
        </View>

        {/* Character Mood */}
        <View style={styles.moodCard}>
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[character.mood]}</Text>
          <Text style={styles.moodText}>{getMoodDescription(character.mood)}</Text>
        </View>

        {/* Character Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Niveau</Text>
              <Text style={styles.statValue}>{character.global_level}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Coins</Text>
              <Text style={styles.statValue}>💰 {character.coins}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gems</Text>
              <Text style={styles.statValue}>💎 {character.gems}</Text>
            </View>
          </View>
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>
              🔥 Streak: {character.current_streak} jour{character.current_streak !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.recordText}>
              Record: {character.longest_streak}
            </Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpCard}>
          <Text style={styles.sectionTitle}>Progression Globale</Text>
          <XPProgressBar
            currentLevel={character.global_level}
            currentXP={character.global_xp}
          />
        </View>

        {/* Domain Skills */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Compétences par Domaine</Text>
          {domainSkills.map((skill) => (
            <DomainSkillCard key={skill.id} skill={skill} />
          ))}
        </View>

        {/* Notification Toggle */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>🔔 Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
              thumbColor={notificationsEnabled ? '#6366f1' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  moodCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  recordText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  xpCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  skillsSection: {
    marginBottom: 24,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
