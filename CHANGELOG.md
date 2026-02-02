# Changelog - GrowGame

Tous les changements significatifs dans ce projet sont documentés ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Unreleased]

### Maintenance (2026-02-02)

#### Fixed

- **Résolution du mismatch Worklets** : L'application ne compilait pas avec l'erreur `[WorkletsError: Mismatch between JavaScript part and native part of Worklets (0.7.2 vs 0.5.1)]`
  - Mise à jour de expo@54.0.33 et expo-router@6.0.23
  - Remplacement de `react-native-reanimated` par `React.Animated` natif (plus portable)
  - Affecte 4 fichiers: `XPToast.tsx`, `LeaderboardCard.tsx`, `XPProgressBar.tsx`, `habits.tsx`

#### Changed

- Architecture des animations: passage de dépendances natives (`react-native-reanimated`) à l'API standard React Native
- Watchman cleanup pour améliorer la stabilité du bundler

#### Notes

- L'application compile maintenant sans erreurs
- Compatible avec Expo Go sans development build requis
- Pas de perte fonctionnelle des animations (toujours fluides)

---

## [Phase 3] - Gamification

### Système de Classement Rangé (2025-12-29)

- Implémentation du ranked leaderboard global et hebdomadaire
- Système de points basé sur XP acquis
- Affichage des top 100 joueurs
- Historique des positions précédentes

### Système de Journal (2025-12-28)

- Logs des complétions d'habitudes avec timestamps
- Entrées avec photos optionnelles
- Affichage de l'historique de progression
- Calcul de streaks à partir des logs

### Système de Quêtes (2025-12-27)

- Quêtes quotidiennes/hebdomadaires
- Récompenses XP/coins pour les quêtes
- Progression visuelle des quêtes
- Interface de sélection/complétion

### Système de Decay (2025-12-27)

- Compétences décayent après 7 jours d'inactivité
- Notification visuelle de la décadence
- Récupération progressive en se réengageant

### Système de Streak (2025-12-27)

- Calcul du streak courant et meilleur streak
- Bonus coins aux milestones (7, 14, 30, 60, 100 jours)
- Réinitialisation après 1 jour d'inactivité
- Affichage dans le dashboard

---

## [Phase 2] - Core Loop MVP

### Validation d'Habitudes (2025-12-25)

- Complétion toggle avec checkbox
- Calcul XP/coins selon difficulté
- Prevention des doublons (1 fois/jour max)
- Update automatique du character et domain_skills

### Gestion des Habitudes (2025-12-24)

- CRUD complet (Créer, Lire, Modifier, Supprimer)
- Sélection domaine et difficulté
- List view avec filtrage par domaine
- Modals de création/édition

### Dashboard Personnage (2025-12-23)

- Affichage stats principales (level, XP, coins)
- Progression par domaine avec barres XP
- Calcul automatique des niveaux
- Indicateur d'humeur emoji

---

## [Phase 1] - Backend & Auth

### Création du Personnage (2025-12-22)

- Création automatique au signup
- Initialisation des 5 domain_skills
- Valeurs par défaut (level 1, 0 XP/coins)

### Authentification (2025-12-21)

- Sign up avec email/password + character name
- Sign in/out avec persistance de session
- Redirection automatique (auth ↔ tabs)
- RLS (Row Level Security) sur toutes les tables

### Setup Supabase (2025-12-21)

- Configuration projet Supabase
- Schéma DB avec 7 tables principales
- Migrations SQL versionées
- Variables d'environnement

---

## [Phase 0] - Setup & Infrastructure

### Configuration Initiale (2025-12-21)

- Projet Expo + TypeScript + React Native
- Expo Router pour navigation file-based
- Zustand pour state management
- Structure de base (app/, src/)
- Documentation (README, CONTRIBUTING, SETUP)

---

## Notes de Développement

### Stack Technique

- **Frontend**: React Native 0.81.5 + Expo SDK 54
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: Zustand 5.0
- **Navigation**: Expo Router 6.0
- **Animations**: React.Animated (natif)
- **Language**: TypeScript 5.9

### Principes

- **Pragmatisme** : Features simples d'abord, complexité ensuite
- **Maintenabilité** : Code clair > code parfait
- **Testabilité** : Features testées manuellement avant ship
- **Documentabilité** : Chaque changement major documenté

### Conventions

- Noms en français pour domaines métier (habitudes, personnage)
- Noms en anglais pour code technique (services, stores, types)
- Variables préfixées par emoji dans les logs (🚪 auth, 🔄 sync, etc.)
- Commits conventionnels (feat, fix, docs, refactor, test)

---

## Support

Pour plus de détails techniques, voir [TRACE.md](TRACE.md)
