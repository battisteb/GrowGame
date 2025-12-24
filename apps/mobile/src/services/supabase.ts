/**
 * Supabase Client Configuration
 *
 * Client singleton pour toutes les interactions avec Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, validateEnv } from '../config/env';

// Valider les variables d'environnement au démarrage
const envValidation = validateEnv();
if (!envValidation.valid) {
  console.warn('⚠️  Missing Supabase environment variables:', envValidation.missing);
}

// Créer le client Supabase
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    // Persister la session dans AsyncStorage
    storage: undefined, // TODO: configurer AsyncStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Test de connexion à Supabase
 * Utile pour vérifier que la configuration est correcte
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('shop_items').select('count').limit(1);

    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};
