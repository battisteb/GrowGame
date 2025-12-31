/**
 * Photo Capture Modal
 *
 * Modal to capture or select a photo for ranked mode habit completion
 * - Camera or gallery selection
 * - Photo preview
 * - Confirmation before submission
 */

import { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PhotoCaptureModalProps {
  visible: boolean;
  habitName: string;
  onPhotoSelected: (photoUri: string) => Promise<void>;
  onCancel: () => void;
}

export function PhotoCaptureModal({
  visible,
  habitName,
  onPhotoSelected,
  onCancel,
}: PhotoCaptureModalProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTakePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission caméra requise pour prendre une photo');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSelectPhoto = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission galerie requise pour sélectionner une photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!photoUri) return;

    setIsSubmitting(true);
    try {
      await onPhotoSelected(photoUri);
      // Reset state
      setPhotoUri(null);
    } catch (error) {
      console.error('Error submitting photo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPhotoUri(null);
    setIsSubmitting(false);
    onCancel();
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📸 Photo de preuve</Text>
            <Text style={styles.subtitle}>
              Prends une photo de : {habitName}
            </Text>
          </View>

          {/* Photo Preview or Selection */}
          {photoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetake}
                disabled={isSubmitting}
              >
                <Text style={styles.retakeButtonText}>🔄 Reprendre</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectionContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
              >
                <Text style={styles.captureEmoji}>📷</Text>
                <Text style={styles.captureText}>Prendre une photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.galleryButton}
                onPress={handleSelectPhoto}
              >
                <Text style={styles.galleryEmoji}>🖼️</Text>
                <Text style={styles.galleryText}>Choisir de la galerie</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info hint */}
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 La photo sera vérifiée par IA pour valider ton activité
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            {photoUri && (
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting || !photoUri}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>✅ Valider</Text>
                )}
              </TouchableOpacity>
            )}
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
  selectionContainer: {
    gap: 12,
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: '#6366f1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  captureEmoji: {
    fontSize: 24,
  },
  captureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  galleryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  galleryEmoji: {
    fontSize: 24,
  },
  galleryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  previewContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  retakeButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  hint: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  hintText: {
    fontSize: 13,
    color: '#1e40af',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
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
