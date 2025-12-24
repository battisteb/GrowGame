# Journal de Bord - GrowGame

> Ce fichier trace les décisions majeures et actions importantes du projet.
> Objectif : permettre à chaque membre de l'équipe de se synchroniser rapidement.

---

## Comment utiliser ce fichier

- **Ajouter une entrée** quand : décision technique importante, feature terminée, changement d'architecture, réunion clé
- **Format** : `### [DATE] - Titre court` suivi d'un résumé
- **Être concis** : quelques lignes suffisent, les détails sont dans le code ou ARCHITECTURE.md

---

## Architecture & Setup

### [2025-12-21] - Choix de la stack technique

**Participants** : Équipe + Claude (assistant IA)

**Décisions prises** :

- **Framework** : React Native + Expo (SDK 52+)
  - Raison : équipe connaît React, Expo simplifie le développement mobile
- **Backend** : Supabase
  - Raison : open-source, PostgreSQL intégré, Auth/Storage/Realtime inclus, pas de vendor lock-in
- **État global** : Zustand
  - Raison : simple, léger, pas de boilerplate Redux
- **Navigation** : Expo Router (file-based routing)
- **Langage** : TypeScript strict
- **Offline-first** : WatermelonDB pour la DB locale

**Alternatives écartées** :

- Flutter : équipe ne connaît pas Dart
- Firebase : vendor lock-in Google trop fort
- Redux : overkill pour 2 développeurs

---

### [2025-12-21] - Structure du projet définie

**Décision** : Architecture feature-based

```
apps/mobile/
├── app/          # Routes Expo Router
├── src/
│   ├── features/ # Modules métier (auth, character, habits...)
│   ├── components/
│   │   ├── ui/       # Design system
│   │   └── domain/   # Composants métier
│   ├── stores/   # État global Zustand
│   ├── services/ # API Supabase
│   └── ...
```

**Pourquoi** :

- Chaque feature est isolée et testable
- Facilite le travail à deux (ownership clair)
- Prépare l'extension future (web, etc.)

---

### [2025-12-21] - Répartition initiale du travail

| Dev      | Responsabilités                    |
| -------- | ---------------------------------- |
| Dev A    | Auth, Character, Progression       |
| Dev B    | Habits, Quests, Vérification photo |
| Ensemble | Setup, DB, Design system           |

---

## Features & Développement

> Ajouter ici les features majeures terminées

<!-- Exemple :
### [2025-XX-XX] - Auth flow terminé

**Ce qui a été fait** :
- Inscription/connexion email
- Écran de création de personnage
- Persistance de session

**Fichiers clés** : `features/auth/`, `app/(auth)/`
-->

---

## Base de Données

### [2025-12-21] - Schéma initial défini

**Tables créées** (conceptuellement) :

- `characters` : personnage de l'utilisateur
- `domain_skills` : niveaux par domaine (études, sport, etc.)
- `habits` : habitudes configurées
- `habit_logs` : historique de complétion
- `shop_items` : items de la boutique
- `user_items` : items possédés
- `equipments` : équipement actuel

**Détails** : voir [ARCHITECTURE.md](ARCHITECTURE.md#schéma-de-base-de-données)

---

## Design & UI

> Ajouter ici les décisions de design importantes

<!-- Exemple :
### [2025-XX-XX] - Palette de couleurs validée

Couleurs principales définies dans `DA/Couleurs Principales.md`
Implémentation dans `src/constants/colors.ts`
-->

---

## Bugs & Incidents

> Ajouter ici les bugs majeurs résolus ou incidents importants

<!-- Exemple :
### [2025-XX-XX] - Fix crash au démarrage iOS

**Problème** : L'app crashait sur iOS 17 à cause de...
**Solution** : Mise à jour de la dépendance X
**Commit** : abc123
-->

---

## Réunions & Syncs

> Ajouter ici les points importants des réunions d'équipe

### [2025-12-21] - Kickoff technique avec Claude

**Participants** : Équipe + Claude

**Ordre du jour** :

1. Analyse de la documentation existante
2. Proposition de stack technique
3. Validation de l'architecture
4. Création des fichiers de base

**Actions** :

- [x] Créer ARCHITECTURE.md
- [x] Créer TRACE.md
- [x] Créer SETUP.md (guide d'installation)
- [x] Initialiser le projet Expo
- [ ] Setup Supabase

---

### [2025-12-21] - Projet Expo initialisé

**Ce qui a été fait** :

- Création du projet Expo avec TypeScript (`apps/mobile/`)
- Installation des dépendances :
  - expo-router (navigation file-based)
  - zustand (state management)
  - @supabase/supabase-js (client Supabase)
  - react-native-reanimated, react-native-gesture-handler
  - date-fns
  - ESLint + Prettier (dev)
- Configuration Expo Router avec structure de navigation :
  - `(tabs)/` : Home, Habits, Character, Shop
  - `(auth)/` : Login, Register
- Création des fichiers de base :
  - `src/types/index.ts` : Types TypeScript (Character, Habit, etc.)
  - `src/constants/game.ts` : Formules XP, récompenses, decay
  - `src/constants/theme.ts` : Couleurs, spacing, shadows
- Configuration VS Code (settings.json, extensions.json)

**Fichiers clés** :

- [app.json](../apps/mobile/app.json) : Config Expo
- [package.json](../apps/mobile/package.json) : Dépendances et scripts
- [src/types/](../apps/mobile/src/types/) : Types TypeScript
- [src/constants/](../apps/mobile/src/constants/) : Constantes du jeu

**Scripts disponibles** :

```bash
npm start       # Démarre le serveur dev
npm run lint    # Vérifie le code
npm run format  # Formate le code
```

---

### [2025-12-21] - Mise en place Git et collaboration

**Ce qui a été fait** :

- Initialisation du repository Git (`git init`, branche `main`)
- Création du `.gitignore` global (racine du projet)
- Configuration des environnements :
  - `.env.example` : template de référence
  - `src/config/env.ts` : gestion centralisée des variables d'environnement
  - Support de 3 environnements : `development`, `staging`, `production`
- Documentation de collaboration :
  - `CONTRIBUTING.md` : workflow Git, conventions de commits, PR process
  - `README.md` : présentation du projet pour GitHub

**Workflow Git choisi** : GitHub Flow

- Branche `main` = production-ready
- Branches feature/fix/chore pour le développement
- Merge via Pull Request avec review

**Conventions de commits** : Conventional Commits

- `feat:` pour les nouvelles features
- `fix:` pour les corrections
- `docs:`, `refactor:`, `chore:` pour le reste

**Scripts ajoutés** :

```bash
npm run check      # typecheck + lint
npm run precommit  # vérification avant commit
```

### [2025-12-21] - Mise en place Git et collaboration

- Modification /ajout des dependances "react-dom": "19.1.0" et "react-native-web": "^0.21.2" pour l'execution de l'app sur web et sur mobile

---

### [2025-12-21] - Roadmap et plan d'avancement

**Ce qui a été fait** :
- Création de `TODO.md` : roadmap complète du projet
- Organisation en 6 phases (Phase 0 à 5)
- Découpage en features numérotées [0001] à [0020]
- Section "Tâche en cours" détaillée
- Priorisation et dépendances entre tasks

**Plan d'avancement** :
- **Phase 0** (Setup) : ✅ Terminée
- **Phase 1** (Backend & Auth) : 🔄 Prochaine (tâche [0001] en cours)
- **Phase 2** (Core Loop MVP) : Validation habitudes + XP
- **Phase 3** (Gamification) : Streak, decay, humeur
- **Phase 4** (Shop) : Cosmétiques et récompenses
- **Phase 5** (Polish) : Vérification photo, notifications, animations

**Prochaine étape** : [0001] Setup Supabase (création projet, schema DB, connexion)

---

### [2025-12-24] - [0004] Authentification avec Supabase

**Ce qui a été fait** :
- Création du service d'authentification (`auth.service.ts`)
  - Fonctions: signUp, signIn, signOut, getSession, getCurrentUser
  - Gestion du reset de mot de passe
  - Support des auth state changes
- Création du store Zustand pour l'état d'authentification (`authStore.ts`)
  - État global: user, session, isLoading, isInitialized
  - Actions: initialize, login, register, logout
- Création des écrans d'authentification
  - Login screen avec email/password
  - Register screen avec name, email, password
  - Validation des inputs et gestion des erreurs
- Mise en place de la persistence de session
  - Installation de @react-native-async-storage/async-storage
  - Configuration du client Supabase avec AsyncStorage
  - Auto-login au démarrage de l'app
- Implémentation du routing basé sur l'authentification
  - AuthProvider pour initialiser l'auth au démarrage
  - Protection des routes (tabs) pour les utilisateurs connectés uniquement
  - Redirection automatique login/home selon l'état auth
- Ajout d'un bouton de déconnexion dans l'écran Home
  - Affichage du nom de l'utilisateur connecté
  - Confirmation avant déconnexion

**Tests effectués** :
✅ TypeScript compilation sans erreurs
✅ Toutes les dépendances installées correctement

**Prochaine étape** : [0005] Création du personnage au signup (auto-create character + domain_skills)

---

## Notes Diverses

> Informations utiles qui ne rentrent pas dans les autres catégories

<!-- Exemple :
### [2025-XX-XX] - Compte Supabase créé

URL : https://xxx.supabase.co
Admin : email@...
-->
