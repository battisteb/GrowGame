/**
 * Habit Form Component
 *
 * Modal form for creating and editing habits
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { Domain, Difficulty, Habit } from '../types';
import { DOMAIN_INFO } from '../constants/game';
import { DOMAINS } from '../types';

interface HabitFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    domain: Domain;
    name: string;
    difficulty: Difficulty;
  }) => void;
  initialData?: Habit | null;
}

const DIFFICULTIES: Difficulty[] = [1, 2, 3];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Facile',
  2: 'Moyen',
  3: 'Difficile',
};

export function HabitForm({
  visible,
  onClose,
  onSubmit,
  initialData,
}: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [domain, setDomain] = useState<Domain>(initialData?.domain || 'etudes');
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty || 1
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    onSubmit({ domain, name: name.trim(), difficulty });

    // Reset form
    setName('');
    setDomain('etudes');
    setDifficulty(1);
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setName(initialData?.name || '');
    setDomain(initialData?.domain || 'etudes');
    setDifficulty(initialData?.difficulty || 1);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>
                  {initialData ? 'Modifier l\'habitude' : 'Nouvelle habitude'}
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Habit Name */}
              <View style={styles.section}>
                <Text style={styles.label}>Nom de l'habitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Lire 30 minutes"
                  value={name}
                  onChangeText={setName}
                  maxLength={100}
                  autoFocus
                />
              </View>

              {/* Domain Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Domaine</Text>
                <View style={styles.optionsGrid}>
                  {DOMAINS.map((d) => {
                    const info = DOMAIN_INFO[d];
                    const isSelected = domain === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.optionCard,
                          isSelected && {
                            backgroundColor: info.color,
                            borderColor: info.color,
                          },
                        ]}
                        onPress={() => setDomain(d)}
                      >
                        <Text style={styles.optionEmoji}>{info.emoji}</Text>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {info.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Difficulty Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Difficulté</Text>
                <View style={styles.difficultyRow}>
                  {DIFFICULTIES.map((d) => {
                    const isSelected = difficulty === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.difficultyButton,
                          isSelected && styles.difficultyButtonSelected,
                        ]}
                        onPress={() => setDifficulty(d)}
                      >
                        <Text
                          style={[
                            styles.difficultyStars,
                            isSelected && styles.difficultyStarsSelected,
                          ]}
                        >
                          {'⭐'.repeat(d)}
                        </Text>
                        <Text
                          style={[
                            styles.difficultyLabel,
                            isSelected && styles.difficultyLabelSelected,
                          ]}
                        >
                          {DIFFICULTY_LABELS[d]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !name.trim() && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!name.trim()}
              >
                <Text style={styles.submitButtonText}>
                  {initialData ? 'Modifier' : 'Créer l\'habitude'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  difficultyButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  difficultyStars: {
    fontSize: 16,
  },
  difficultyStarsSelected: {
    opacity: 1,
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  difficultyLabelSelected: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
