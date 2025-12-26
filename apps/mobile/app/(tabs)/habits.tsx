/**
 * Habits Screen
 *
 * Manage daily habits (CRUD operations)
 * Completion/validation will be added in [0008]
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacterStore } from '../../src/stores/characterStore';
import { useHabitsStore } from '../../src/stores/habitsStore';
import { HabitCard } from '../../src/components/HabitCard';
import { HabitForm } from '../../src/components/HabitForm';
import { showConfirmAlert } from '../../src/utils/alert';
import type { Domain, Difficulty, Habit } from '../../src/types';

export default function HabitsScreen() {
  const { character } = useCharacterStore();
  const { habits, isLoading, loadHabits, addHabit, editHabit, removeHabit } =
    useHabitsStore();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Load habits when character is available
  useEffect(() => {
    if (character?.id) {
      loadHabits(character.id);
    }
  }, [character?.id, loadHabits]);

  const handleAddHabit = async (data: {
    domain: Domain;
    name: string;
    difficulty: Difficulty;
  }) => {
    if (!character?.id) return;

    const success = await addHabit({
      character_id: character.id,
      ...data,
    });

    if (success) {
      console.log('✅ Habit added successfully');
    }
  };

  const handleEditHabit = async (data: {
    domain: Domain;
    name: string;
    difficulty: Difficulty;
  }) => {
    if (!editingHabit) return;

    const success = await editHabit(editingHabit.id, data);

    if (success) {
      console.log('✅ Habit updated successfully');
      setEditingHabit(null);
    }
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    showConfirmAlert(
      'Supprimer l\'habitude',
      `Voulez-vous vraiment supprimer "${habitName}" ?`,
      async () => {
        const success = await removeHabit(habitId);
        if (success) {
          console.log('✅ Habit deleted successfully');
        }
      }
    );
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setEditingHabit(null);
  };

  if (!character) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun personnage trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && habits.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement des habitudes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes Habitudes</Text>
          <Text style={styles.subtitle}>
            {habits.length} habitude{habits.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsFormVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Habits List */}
      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>Aucune habitude</Text>
          <Text style={styles.emptySubtitle}>
            Créez votre première habitude pour commencer à progresser !
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setIsFormVisible(true)}
          >
            <Text style={styles.emptyButtonText}>Créer une habitude</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              onPress={() => openEditForm(item)}
              onDelete={() => handleDeleteHabit(item.id, item.name)}
            />
          )}
          refreshing={isLoading}
          onRefresh={() => character?.id && loadHabits(character.id)}
        />
      )}

      {/* Habit Form Modal */}
      <HabitForm
        visible={isFormVisible}
        onClose={closeForm}
        onSubmit={editingHabit ? handleEditHabit : handleAddHabit}
        initialData={editingHabit}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});
