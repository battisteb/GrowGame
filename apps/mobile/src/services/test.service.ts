/**
 * Service de test pour Supabase
 * Temporaire - uniquement pour valider la connexion
 */

import { supabase } from './supabase';

/**
 * Test complet de la connexion Supabase
 */
export const runSupabaseTests = async () => {
  console.log('🧪 Running Supabase connection tests...');

  try {
    // Test 1: Connexion basique
    const { data: items, error: itemsError } = await supabase
      .from('shop_items')
      .select('*')
      .limit(5);

    if (itemsError) {
      console.error('❌ Test 1 failed:', itemsError.message);
      return false;
    }

    console.log('✅ Test 1 passed: Connected to Supabase');
    console.log(`   Found ${items?.length || 0} shop items`);

    // Test 2: Vérifier les tables
    const tables = ['characters', 'domain_skills', 'habits', 'habit_logs'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.error(`❌ Table ${table} not accessible:`, error.message);
        return false;
      }
    }

    console.log('✅ Test 2 passed: All tables accessible');

    // Test 3: Vérifier l'auth
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('✅ Test 3 passed: Auth configured');
    console.log(`   Current session: ${session ? 'logged in' : 'not logged in'}`);

    console.log('🎉 All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Tests failed:', error);
    return false;
  }
};
