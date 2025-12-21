import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder data - will come from store/API later
const MOCK_HABITS = [
  { id: '1', name: '30 min de lecture', domain: 'lecture', difficulty: 2, completed: false },
  { id: '2', name: 'Méditation 10 min', domain: 'meditation', difficulty: 1, completed: true },
  { id: '3', name: 'Exercice physique', domain: 'sport', difficulty: 3, completed: false },
  { id: '4', name: 'Étirements', domain: 'etirements', difficulty: 1, completed: false },
];

const DOMAIN_EMOJIS: Record<string, string> = {
  lecture: '📚',
  meditation: '🧘',
  sport: '💪',
  etirements: '🤸',
  etudes: '📖',
};

export default function HabitsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Habitudes du jour</Text>
        <Text style={styles.subtitle}>1/4 complétées</Text>
      </View>

      <FlatList
        data={MOCK_HABITS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.habitCard, item.completed && styles.habitCardCompleted]}
          >
            <Text style={styles.habitEmoji}>{DOMAIN_EMOJIS[item.domain] || '✨'}</Text>
            <View style={styles.habitInfo}>
              <Text style={[styles.habitName, item.completed && styles.habitNameCompleted]}>
                {item.name}
              </Text>
              <Text style={styles.habitDifficulty}>
                {'⭐'.repeat(item.difficulty)}
              </Text>
            </View>
            <View style={[styles.checkBox, item.completed && styles.checkBoxCompleted]}>
              {item.completed && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
  },
  habitEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  habitDifficulty: {
    fontSize: 12,
    marginTop: 4,
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkMark: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
