/**
 * Habits Screen
 *
 * Manage daily habits with completion tracking
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacterStore } from '../../src/stores/characterStore';
import { useHabitsStore } from '../../src/stores/habitsStore';
import { useAuthStore } from '../../src/stores/authStore';
import { HabitCard } from '../../src/components/HabitCard';
import { HabitForm } from '../../src/components/HabitForm';
import { JournalPromptModal } from '../../src/components/JournalPromptModal';
import { CompletionModeModal } from '../../src/components/CompletionModeModal';
import { PhotoCaptureModal } from '../../src/components/PhotoCaptureModal';
import { showConfirmAlert } from '../../src/utils/alert';
import type { Domain, Difficulty, Habit, CompletionMode } from '../../src/types';

export default function HabitsScreen() {
  const { user } = useAuthStore();
  const { character, refreshCharacter } = useCharacterStore();
  const {
    habits,
    todayLogs,
    isLoading,
    loadHabits,
    loadTodayLogs,
    addHabit,
    editHabit,
    removeHabit,
    toggleHabitCompletion,
    completeHabitRanked,
    journalPromptVisible,
    journalPromptData,
    hideJournalPrompt,
  } = useHabitsStore();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Ranked mode state
  const [modeModalVisible, setModeModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Load habits and today's logs when character is available
  useEffect(() => {
    if (character?.id) {
      loadHabits(character.id);
      loadTodayLogs(character.id);
    }
  }, [character?.id, loadHabits, loadTodayLogs]);

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

  const handleToggleCompletion = async (habit: Habit) => {
    if (!character?.id) return;

    const isCompleted = todayLogs.has(habit.id);

    if (isCompleted) {
      // Uncomplete the habit (existing flow)
      const success = await toggleHabitCompletion(habit, character.id);
      if (success) {
        await refreshCharacter();
      }
    } else {
      // Not completed yet - show mode selection modal
      setSelectedHabit(habit);
      setModeModalVisible(true);
    }
  };

  const handleModeSelected = async (mode: CompletionMode) => {
    setModeModalVisible(false);

    if (!selectedHabit || !character?.id) return;

    if (mode === 'normal') {
      // Complete in normal mode (existing flow)
      const success = await toggleHabitCompletion(selectedHabit, character.id);
      if (success) {
        await refreshCharacter();
      }
      setSelectedHabit(null);
    } else {
      // Ranked mode - show photo modal
      setPhotoModalVisible(true);
    }
  };

  const handlePhotoSelected = async (photoUri: string) => {
    if (!selectedHabit || !character?.id || !user?.id) {
      setPhotoModalVisible(false);
      setSelectedHabit(null);
      return;
    }

    const result = await completeHabitRanked(
      selectedHabit,
      character.id,
      user.id,
      photoUri
    );

    setPhotoModalVisible(false);
    setSelectedHabit(null);

    if (result.success) {
      await refreshCharacter();
    } else {
      // Show error alert
      Alert.alert(
        'Erreur de vérification',
        result.error || 'La photo n\'a pas pu être vérifiée',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelMode = () => {
    setModeModalVisible(false);
    setSelectedHabit(null);
  };

  const handleCancelPhoto = () => {
    setPhotoModalVisible(false);
    setSelectedHabit(null);
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setEditingHabit(null);
  };

  const handleRefresh = async () => {
    if (character?.id) {
      await Promise.all([
        loadHabits(character.id),
        loadTodayLogs(character.id),
        refreshCharacter(),
      ]);
    }
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

  // Calculate completion stats
  const completedCount = Array.from(todayLogs.values()).length;
  const totalCount = habits.length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Habitudes du jour</Text>
          <Text style={styles.subtitle}>
            {completedCount} / {totalCount} complétée{totalCount > 1 ? 's' : ''}
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
          renderItem={({ item }) => {
            const isCompleted = todayLogs.has(item.id);
            return (
              <HabitCompletionCard
                habit={item}
                isCompleted={isCompleted}
                onToggle={() => handleToggleCompletion(item)}
                onEdit={() => openEditForm(item)}
                onDelete={() => handleDeleteHabit(item.id, item.name)}
              />
            );
          }}
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Habit Form Modal */}
      <HabitForm
        visible={isFormVisible}
        onClose={closeForm}
        onSubmit={editingHabit ? handleEditHabit : handleAddHabit}
        initialData={editingHabit}
      />

      {/* Journal Prompt Modal */}
      {journalPromptData && (
        <JournalPromptModal
          visible={journalPromptVisible}
          characterId={journalPromptData.characterId}
          habitLogId={journalPromptData.habitLogId}
          habitName={journalPromptData.habitName}
          onClose={hideJournalPrompt}
          onSuccess={(xpEarned) => {
            console.log(`📝 Journal entry created! +${xpEarned} XP`);
            refreshCharacter();
          }}
        />
      )}

      {/* Completion Mode Modal (Normal vs Ranked) */}
      {selectedHabit && (
        <CompletionModeModal
          visible={modeModalVisible}
          habitName={selectedHabit.name}
          onSelectMode={handleModeSelected}
          onCancel={handleCancelMode}
        />
      )}

      {/* Photo Capture Modal (for Ranked mode) */}
      {selectedHabit && (
        <PhotoCaptureModal
          visible={photoModalVisible}
          habitName={selectedHabit.name}
          onPhotoSelected={handlePhotoSelected}
          onCancel={handleCancelPhoto}
        />
      )}
    </SafeAreaView>
  );
}

// =============================================================================
// HABIT COMPLETION CARD
// =============================================================================

interface HabitCompletionCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function HabitCompletionCard({
  habit,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
}: HabitCompletionCardProps) {
  const { DOMAIN_INFO } = require('../../src/constants/game');
  const domainInfo = DOMAIN_INFO[habit.domain];

  const DIFFICULTY_STARS: Record<number, string> = {
    1: '⭐',
    2: '⭐⭐',
    3: '⭐⭐⭐',
  };

  return (
    <View
      style={[styles.habitCard, isCompleted && styles.habitCardCompleted]}
    >
      {/* Left side: Domain badge and info */}
      <View style={styles.habitLeft}>
        <View
          style={[
            styles.domainBadge,
            { backgroundColor: domainInfo.color },
            isCompleted && styles.domainBadgeCompleted,
          ]}
        >
          <Text style={styles.domainEmoji}>{domainInfo.emoji}</Text>
        </View>
        <View style={styles.habitInfo}>
          <Text
            style={[
              styles.habitName,
              isCompleted && styles.habitNameCompleted,
            ]}
          >
            {habit.name}
          </Text>
          <View style={styles.habitMeta}>
            <Text style={styles.domainName}>{domainInfo.name}</Text>
            <Text style={styles.difficulty}>
              {DIFFICULTY_STARS[habit.difficulty]}
            </Text>
          </View>
        </View>
      </View>

      {/* Right side: Actions */}
      <View style={styles.habitActions}>
        {/* Edit button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>

        {/* Completion checkbox */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            isCompleted && styles.checkboxCompleted,
          ]}
          onPress={onToggle}
        >
          {isCompleted && <Text style={styles.checkMark}>✓</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

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

  // Habit card styles
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitCardCompleted: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  domainBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  domainBadgeCompleted: {
    opacity: 0.7,
  },
  domainEmoji: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  domainName: {
    fontSize: 13,
    color: '#6b7280',
  },
  difficulty: {
    fontSize: 12,
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  editIcon: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  checkboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
