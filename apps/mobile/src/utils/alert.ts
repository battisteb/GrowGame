/**
 * Alert Utility
 *
 * Provides cross-platform alert functionality
 * - Uses Alert on native platforms
 * - Uses window.confirm/alert on web
 */

import { Alert, Platform } from 'react-native';

export const showAlert = (
  title: string,
  message?: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  if (Platform.OS === 'web') {
    // Web implementation
    const fullMessage = message ? `${title}\n\n${message}` : title;

    if (!buttons || buttons.length === 1) {
      // Simple alert
      window.alert(fullMessage);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    } else {
      // Confirmation dialog
      const result = window.confirm(fullMessage);

      // Find the appropriate button to trigger
      const confirmButton = buttons.find(b => b.style !== 'cancel');
      const cancelButton = buttons.find(b => b.style === 'cancel');

      if (result && confirmButton?.onPress) {
        confirmButton.onPress();
      } else if (!result && cancelButton?.onPress) {
        cancelButton.onPress();
      }
    }
  } else {
    // Native implementation
    Alert.alert(title, message, buttons);
  }
};

export const showSuccessAlert = (title: string, message: string, onPress?: () => void) => {
  showAlert(title, message, [{ text: 'OK', onPress }]);
};

export const showErrorAlert = (title: string, message: string) => {
  showAlert(title, message, [{ text: 'OK' }]);
};

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  showAlert(title, message, [
    { text: 'Annuler', style: 'cancel', onPress: onCancel },
    { text: 'Confirmer', onPress: onConfirm },
  ]);
};
