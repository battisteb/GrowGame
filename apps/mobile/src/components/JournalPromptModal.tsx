/**
 * Journal Prompt Modal
 *
 * Modal displayed after habit completion to optionally write a journal entry
 * - Optional but encouraged
 * - Awards +5 XP bonus
 * - Can be skipped
 */

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { createJournalEntry } from '../services/journal.service';
import { useQuestStore } from '../stores/questStore';
import type { Mood } from '../types';

interface JournalPromptModalProps {
  visible: boolean;
  characterId: string;
  habitLogId: string;
  habitName: string;
  onClose: () => void;
  onSuccess?: (xpEarned: number) => void;
}

export function JournalPromptModal({
  visible,
  characterId,
  habitLogId,
  habitName,
  onClose,
  onSuccess,
}: JournalPromptModalProps) {
  const [entryText, setEntryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkip = () => {
    setEntryText('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!entryText.trim()) {
      handleSkip();
      return;
    }

    setIsSubmitting(true);

    const result = await createJournalEntry({
      characterId,
      entryText,
      habitLogId,
    });

    setIsSubmitting(false);

    if (result.success && result.xpEarned) {
      onSuccess?.(result.xpEarned);
      // Update quest progress for journal writing
      useQuestStore.getState().onJournalWritten(characterId).catch(console.error);
    }

    setEntryText('');
    onClose();
  };

  const remainingChars = 1000 - entryText.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📝 Journal du jour</Text>
            <Text style={styles.subtitle}>
              Comment s'est passé : {habitName} ?
            </Text>
          </View>

          {/* Input */}
          <TextInput
            style={styles.input}
            value={entryText}
            onChangeText={setEntryText}
            placeholder="Partage tes réflexions... (optionnel)"
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={1000}
            textAlignVertical="top"
            editable={!isSubmitting}
          />

          {/* Character count */}
          <Text style={styles.charCount}>
            {remainingChars} caractères restants
          </Text>

          {/* Bonus hint */}
          <View style={styles.bonusHint}>
            <Text style={styles.bonusText}>💡 Bonus de +5 XP si tu écris quelque chose !</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isSubmitting}
            >
              <Text style={styles.skipButtonText}>Passer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {entryText.trim() ? '✅ Enregistrer' : 'Continuer'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
    maxHeight: 200,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 12,
  },
  bonusHint: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  bonusText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
