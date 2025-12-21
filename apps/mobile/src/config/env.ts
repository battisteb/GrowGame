/**
 * Configuration des environnements
 *
 * Ce fichier centralise l'accès aux variables d'environnement
 * et fournit des valeurs par défaut sécurisées.
 */

export type AppEnvironment = 'development' | 'staging' | 'production';

/**
 * Environnement actuel de l'application
 */
export const APP_ENV: AppEnvironment =
  (process.env.EXPO_PUBLIC_APP_ENV as AppEnvironment) || 'development';

/**
 * Vérifie si on est en mode développement
 */
export const isDevelopment = APP_ENV === 'development';

/**
 * Vérifie si on est en mode staging
 */
export const isStaging = APP_ENV === 'staging';

/**
 * Vérifie si on est en mode production
 */
export const isProduction = APP_ENV === 'production';

/**
 * Configuration Supabase
 */
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;

/**
 * Configuration Google Cloud Vision
 */
export const GOOGLE_VISION_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '',
  enabled: Boolean(process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY),
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  devMenu: process.env.EXPO_PUBLIC_ENABLE_DEV_MENU === 'true' || isDevelopment,
  mockData: process.env.EXPO_PUBLIC_ENABLE_MOCK_DATA === 'true',
} as const;

/**
 * Valide que les variables d'environnement requises sont présentes
 * À appeler au démarrage de l'application
 */
export const validateEnv = (): { valid: boolean; missing: string[] } => {
  const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && !isDevelopment) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Log de la configuration actuelle (masque les clés sensibles)
 */
export const logConfig = (): void => {
  if (!isDevelopment) return;

  console.log('=== App Configuration ===');
  console.log(`Environment: ${APP_ENV}`);
  console.log(`Supabase URL: ${SUPABASE_CONFIG.url || '(not set)'}`);
  console.log(`Supabase Key: ${SUPABASE_CONFIG.anonKey ? '***' : '(not set)'}`);
  console.log(`Google Vision: ${GOOGLE_VISION_CONFIG.enabled ? 'enabled' : 'disabled'}`);
  console.log('=========================');
};
