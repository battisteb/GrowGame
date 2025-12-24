import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { runSupabaseTests } from '../../src/services/test.service';
import { useAuthStore } from '../../src/stores/authStore';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../src/utils/alert';

export default function HomeScreen() {
  const [testing, setTesting] = useState(false);
  const { user, logout } = useAuthStore();

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const success = await runSupabaseTests();
      if (success) {
        showSuccessAlert('✅ Connexion réussie', 'Supabase est correctement configuré !');
      } else {
        showErrorAlert('❌ Erreur', 'Vérifiez les logs de la console');
      }
    } catch (error) {
      showErrorAlert('❌ Erreur', String(error));
    } finally {
      setTesting(false);
    }
  };

  const handleLogout = () => {
    showConfirmAlert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      async () => {
        await logout();
      }
    );
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Aventurier';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GrowGame</Text>
        <Text style={styles.subtitle}>Bienvenue, {userName} !</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Niveau: 1</Text>
          <Text style={styles.statsText}>XP: 0 / 50</Text>
          <Text style={styles.statsText}>Streak: 0 jours</Text>
        </View>

        {/* Bouton de test Supabase */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestConnection}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>
            {testing ? '⏳ Test en cours...' : '🧪 Tester Supabase'}
          </Text>
        </TouchableOpacity>

        {/* Bouton de déconnexion */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>
            🚪 Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 40,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  testButton: {
    marginTop: 24,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
