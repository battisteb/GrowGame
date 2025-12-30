# TODO - GrowGame

> Roadmap et suivi du développement

**Dernière mise à jour** : 2025-12-30

---

## Vision et Objectifs

### Objectif final

Une application mobile de gamification de la discipline personnelle où :
- L'utilisateur valide des habitudes quotidiennes dans 5 domaines
- Son personnage évolue (XP, niveaux, apparence)
- La progression est récompensée (cosmétiques, streak bonus)
- L'échec a des conséquences visuelles (humeur, fatigue)

### Principe directeur

**Pragmatisme avant tout** : on construit une base solide, puis on itère.
- Pas d'over-engineering
- Features simples d'abord, complexité ensuite
- Tester régulièrement sur mobile
- Code maintenable > code parfait

---

## Phases du Projet

```
Phase 0 : Setup & Infrastructure          ✅ TERMINÉE
Phase 1 : Backend & Auth                  ✅ TERMINÉE
Phase 2 : Core Loop MVP                   ✅ TERMINÉE
Phase 3 : Gamification                    🔄 EN COURS
Phase 4 : Shop & Cosmétiques              ⏳ À VENIR
Phase 5 : Polish & Amélioration           ⏳ À VENIR
```

---

## Phase 0 : Setup & Infrastructure ✅

**Objectif** : Préparer l'environnement de développement

| Tâche | Statut | Responsable |
|-------|--------|-------------|
| Initialiser projet Expo + TypeScript | ✅ | Claude |
| Structure de navigation (Expo Router) | ✅ | Claude |
| Configuration Git + GitHub | ✅ | Équipe |
| Documentation (ARCHITECTURE, CONTRIBUTING, SETUP) | ✅ | Claude |
| Types TypeScript de base | ✅ | Claude |
| Constantes du jeu (formules XP, thème) | ✅ | Claude |
| Configuration environnements (dev/staging/prod) | ✅ | Claude |

**Commit initial** : `b7977d1`

---

## Phase 1 : Backend & Auth ✅

**Objectif** : Mettre en place Supabase et l'authentification

### [0003] - Setup Supabase ✅

**Responsable** : Ensemble (puis Dev A ownership)

**Status** : TERMINÉ (commit: 286dc6d)

**Tâches** :
- [x] Créer le projet Supabase (dashboard)
- [x] Configurer les variables `.env` (URLs, keys)
- [x] Créer le schéma de base de données (migrations SQL)
  - [x] Table `characters`
  - [x] Table `domain_skills`
  - [x] Table `habits`
  - [x] Table `habit_logs`
  - [x] Table `shop_items`
  - [x] Table `user_items`
  - [x] Table `equipments`
- [x] Configurer Row Level Security (RLS)
- [x] Tester les connexions depuis l'app

**Fichiers clés** :
- `supabase/migrations/001_initial_schema.sql`
- `apps/mobile/.env`

**Critères de "done"** :
- Projet Supabase créé et accessible
- Schema DB déployé
- App peut se connecter à Supabase

---

### [0004] - Authentification avec Supabase ✅

**Responsable** : Dev A

**Status** : TERMINÉ (commit: 85630c2, PR #2)

**Tâches** :
- [x] Créer le service `src/services/auth.service.ts`
  - [x] Fonction `signUp(email, password, characterName)`
  - [x] Fonction `signIn(email, password)`
  - [x] Fonction `signOut()`
  - [x] Fonction `getCurrentUser()`
- [x] Créer le store `src/stores/authStore.ts`
  - [x] État `user`, `loading`, `error`
  - [x] Actions login/logout/signup
- [x] Implémenter l'écran Login (`app/(auth)/login.tsx`)
- [x] Implémenter l'écran Register (`app/(auth)/register.tsx`)
- [x] Créer la logique de redirection (connecté → tabs, déconnecté → auth)
- [x] Gérer la persistance de session

**Fichiers clés** :
- `apps/mobile/src/services/auth.service.ts`
- `apps/mobile/src/stores/authStore.ts`
- `apps/mobile/app/(auth)/login.tsx`
- `apps/mobile/app/(auth)/register.tsx`
- `apps/mobile/app/index.tsx`

**Critères de "done"** :
- ✅ Un utilisateur peut créer un compte
- ✅ Un utilisateur peut se connecter
- ✅ La session persiste au redémarrage de l'app
- ✅ Les écrans redirigent correctement

---

### [0005] - Création du personnage au signup ✅

**Responsable** : Dev A

**Status** : TERMINÉ (commit: c9f0d76, PR #3)

**Tâches** :
- [x] À l'inscription, créer automatiquement un `character`
- [x] Initialiser les 5 `domain_skills` à niveau 1
- [x] Nom du personnage = nom fourni à l'inscription
- [x] Valeurs par défaut : level 1, 0 XP, 0 coins, humeur neutre

**Fichiers clés** :
- `apps/mobile/src/services/character.service.ts`
- `apps/mobile/src/stores/authStore.ts`

**Critères de "done"** :
- ✅ Après signup, un character est créé en DB
- ✅ Les 5 domain_skills sont initialisés

---

## Phase 2 : Core Loop MVP ✅

**Objectif** : Boucle de jeu de base fonctionnelle

### [0006] - Affichage du personnage et dashboard ✅

**Responsable** : Dev A

**Status** : TERMINÉ (commit: b32e9a7, PR #4)

**Tâches** :
- [x] Créer `src/services/character.service.ts`
  - [x] `getCharacter(userId)`
  - [x] `getDomainSkills(characterId)`
- [x] Créer `src/stores/characterStore.ts`
- [x] Afficher les stats dans `app/(tabs)/home.tsx`
  - [x] Nom, niveau global, XP, coins
  - [x] Liste des 5 domaines avec niveau et XP
  - [x] Barres de progression XP
  - [x] Dashboard avec résumé quotidien
  - [x] Streak actuel
- [x] Afficher l'humeur (emoji)
- [x] Calcul automatique des niveaux (XP → Level)

**Fichiers clés** :
- `apps/mobile/src/services/character.service.ts`
- `apps/mobile/src/stores/characterStore.ts`
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/src/utils/xpCalculator.ts`

**Critères de "done"** :
- ✅ L'écran Home affiche les vraies données de la DB
- ✅ Les barres de progression sont fonctionnelles
- ✅ Le niveau se calcule automatiquement depuis l'XP

---

### [0007] - CRUD des habitudes ✅

**Responsable** : Dev B

**Status** : TERMINÉ (commit: 32120f0, PR #5)

**Tâches** :
- [x] Créer `src/services/habits.service.ts`
  - [x] `getHabits(characterId)`
  - [x] `createHabit(characterId, domain, name, difficulty)`
  - [x] `updateHabit(habitId, data)`
  - [x] `deleteHabit(habitId)`
- [x] Créer `src/stores/habitsStore.ts`
- [x] Implémenter l'écran de gestion des habitudes
  - [x] Liste des habitudes
  - [x] Bouton "Ajouter une habitude"
  - [x] Formulaire de création/édition
- [x] Modal/écran de création d'habitude
  - [x] Choix du domaine
  - [x] Nom de l'habitude
  - [x] Difficulté (facile/moyen/difficile)

**Fichiers clés** :
- `apps/mobile/src/services/habits.service.ts`
- `apps/mobile/src/stores/habitsStore.ts`
- `apps/mobile/app/(tabs)/habits/index.tsx`
- `apps/mobile/app/(tabs)/habits/new.tsx`

**Critères de "done"** :
- ✅ L'utilisateur peut créer/modifier/supprimer des habitudes
- ✅ Les habitudes s'affichent correctement

---

### [0008] - Validation d'habitude (complétion) ✅

**Responsable** : Dev B

**Status** : TERMINÉ (commit: 5323d8e, PR #6)

**Tâches** :
- [x] Créer `src/services/habitLogs.service.ts`
  - [x] `completeHabit(habit, characterId)`
  - [x] `uncompleteHabit(habitId, characterId)`
  - [x] `getTodayLog(habitId)`
- [x] Implémenter la logique de validation (toggle checkbox)
- [x] Calculer XP et coins selon la difficulté
- [x] Créer l'entrée dans `habit_logs`
- [x] Mettre à jour le character (XP, coins) via RPC
- [x] Mettre à jour le domain_skill correspondant via RPC
- [x] Empêcher la validation multiple le même jour

**Fichiers clés** :
- `apps/mobile/src/services/habitLogs.service.ts`
- `apps/mobile/src/stores/habitsStore.ts`
- `supabase/migrations/002_habit_log_trigger.sql`

**Critères de "done"** :
- ✅ Cocher une habitude donne XP et coins
- ✅ Le personnage monte en XP
- ✅ Le domain_skill monte en XP
- ✅ On ne peut valider qu'une fois par jour

---

**Note** : Les fonctionnalités suivantes ont été intégrées dans [0006] et [0008] :
- Calcul des niveaux et progression (via `xpCalculator.ts`)
- Écran d'accueil / Dashboard (dans `home.tsx`)

---

## Phase 3 : Gamification 🔄

**Objectif** : Ajouter les mécaniques de jeu avancées

### [0009] - Système de streak ✅

**Responsable** : Dev B

**Status** : TERMINÉ (commit: 70a3335, PR #7)

**Tâches** :
- [x] Utiliser `last_activity_date` existant dans `characters`
- [x] Créer `streakCalculator.ts` avec logique de calcul
- [x] Calculer le streak :
  - [x] Si activité aujourd'hui → streak continue
  - [x] Si 1 jour de gap → streak reset
  - [x] Stocker `current_streak` et `longest_streak`
- [x] Afficher le streak dans le dashboard
- [x] Bonus aux milestones : 7, 14, 30, 60, 100 jours
- [x] Intégration avec `completeHabit()`
- [x] Correction race condition avec trigger DB

**Fichiers clés** :
- `apps/mobile/src/utils/streakCalculator.ts`
- `apps/mobile/src/services/character.service.ts`
- `apps/mobile/src/services/habitLogs.service.ts`

**Critères de "done"** :
- ✅ Le streak s'incrémente correctement
- ✅ Le streak se reset après 1 jour d'inactivité
- ✅ Bonus aux milestones fonctionnel (7j=10 coins, etc.)

---

### [0010] - Système de decay (compétences) ✅

**Responsable** : Dev A

**Status** : TERMINÉ (commit: 8d08a30, PR #8)

**Tâches** :
- [x] Créer `decayCalculator.ts` avec logique de decay
  - [x] Fonction `calculateDecay()` pour calculer le decay d'un domaine
  - [x] Fonction `calculateDecayForAllDomains()` pour batch processing
  - [x] Règle : après 7 jours → level devient max(1, floor(level/2))
- [x] Créer `applyDecayToAllDomains()` dans character.service
- [x] Intégrer le decay check dans characterStore (au loadCharacter)
- [x] Afficher alerte de decay dans home.tsx
- [x] **Bug fix** : Corriger les barres de progression XP

**Fichiers clés** :
- `apps/mobile/src/utils/decayCalculator.ts`
- `apps/mobile/src/services/character.service.ts`
- `apps/mobile/src/stores/characterStore.ts`
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/src/components/XPProgressBar.tsx`
- `apps/mobile/src/components/DomainSkillCard.tsx`

**Critères de "done"** :
- ✅ Après 7 jours d'inactivité, le niveau du domaine baisse
- ✅ Le niveau ne descend jamais en dessous de la moitié (ou 1)
- ✅ L'utilisateur est notifié du decay
- ✅ Les barres XP affichent la bonne progression

---

### [0011] - Humeur du personnage ✅

**Responsable** : Dev A

**Status** : TERMINÉ (commit: 53a69d0, PR #9)

**Tâches** :
- [x] Ajouter 'sad' mood type et emoji 😢
- [x] Créer `moodCalculator.ts` avec logique de calcul
  - [x] Sad : 3+ jours sans activité
  - [x] Tired : 2 jours sans activité
  - [x] Happy : streak >= 7 jours ET actif récemment
  - [x] Neutral : défaut
- [x] Créer `updateMood()` dans character.service
- [x] Intégrer update mood après complétion d'habitude
- [x] Intégrer update mood au chargement du character
- [x] Afficher carte mood dans home.tsx avec emoji et description

**Fichiers clés** :
- `apps/mobile/src/utils/moodCalculator.ts`
- `apps/mobile/src/services/character.service.ts`
- `apps/mobile/src/services/habitLogs.service.ts`
- `apps/mobile/src/stores/characterStore.ts`
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/src/types/index.ts`
- `apps/mobile/src/constants/game.ts`

**Critères de "done"** :
- ✅ L'humeur change selon l'activité
- ✅ Visuellement représenté avec emoji et message
- ✅ Update automatique après actions utilisateur

---

### [0012] - Journal quotidien ✅

**Responsable** : Dev B

**Status** : TERMINÉ (commit: 3051083, PR #10)

**Tâches** :
- [x] Créer migration `004_journal_entries.sql` avec table et RLS
- [x] Créer type `JournalEntry` dans types
- [x] Créer `journal.service.ts` avec CRUD operations
- [x] Créer `JournalPromptModal` component (optionnel avec skip)
- [x] Intégrer modal dans habits store et screen
- [x] Award +5 XP bonus pour entrée de journal

**Fichiers clés** :
- `supabase/migrations/004_journal_entries.sql`
- `apps/mobile/src/services/journal.service.ts`
- `apps/mobile/src/components/JournalPromptModal.tsx`
- `apps/mobile/src/stores/habitsStore.ts`
- `apps/mobile/app/(tabs)/habits.tsx`
- `apps/mobile/src/types/index.ts`

**Critères de "done"** :
- ✅ L'utilisateur peut écrire un journal après complétion d'habitude
- ✅ +5 XP bonus si journal rempli
- ✅ Peut skip sans pénalité
- ✅ Journal entries stockées avec habit_log link

**Future enhancement** : Vue historique du journal dans character screen

---

## Phase 4 : Shop & Cosmétiques ⏳

**Objectif** : Récompenses visuelles

### [0013] - Shop basique ✅

**Responsable** : Dev A

**Status** : TERMINÉ (commit: cd0b5f9, PR #11)

**Tâches** :
- [x] Peupler la table `shop_items` avec des items de base (34 items: cosmetics, decorations, jokers)
- [x] Créer `src/services/shop.service.ts`
  - [x] `getShopItems()` et `getShopItemsByType()`
  - [x] `purchaseItem()` avec validation coins et ownership
  - [x] `getUserItems()` pour l'inventaire
- [x] Implémenter `app/(tabs)/shop.tsx`
  - [x] Grille 2 colonnes avec rarity badges
  - [x] Filter tabs (All, Cosmetics, Decorations, Jokers)
  - [x] Vérification coins avant achat
  - [x] Tracking ownership (items possédés)
- [x] Créer `shopStore.ts` pour state management
- [x] Fix snake_case/camelCase transformation

**Fichiers clés** :
- `supabase/migrations/005_populate_shop_items.sql`
- `apps/mobile/src/services/shop.service.ts`
- `apps/mobile/src/stores/shopStore.ts`
- `apps/mobile/app/(tabs)/shop.tsx`
- `apps/mobile/src/stores/authStore.ts` (clear shop on logout)

**Critères de "done"** :
- ✅ L'utilisateur peut acheter des items avec ses coins
- ✅ Les items achetés apparaissent dans son inventaire
- ✅ Filtrage par type d'item fonctionnel
- ✅ Prévention des achats en double
- ✅ Déduction automatique des coins

---

### [0014] - Équipement du personnage

**Responsable** : Dev A

**Tâches** :
- [ ] Créer `src/services/equipment.service.ts`
  - [ ] `equipItem(characterId, slot, itemId)`
  - [ ] `getEquippedItems(characterId)`
- [ ] Interface pour équiper les items (onglet Character)
- [ ] Afficher visuellement les items équipés (emojis pour MVP)

**Fichiers clés** :
- `src/services/equipment.service.ts`
- `app/(tabs)/character.tsx`

**Critères de "done"** :
- L'utilisateur peut équiper/déséquiper des items
- Les items équipés sont visibles

---

## Phase 5 : Polish & Amélioration ⏳

**Objectif** : Améliorer l'UX et ajouter les features avancées

### [0015] - Vérification photo (AI)

**Responsable** : Dev B

**Tâches** :
- [ ] Intégrer Google Cloud Vision API ou équivalent
- [ ] Prendre une photo depuis l'app
- [ ] Envoyer l'image à l'API
- [ ] Valider selon le domaine (livre, équipement sport, etc.)
- [ ] Permettre le mode "confiance" (sans vérification) en dev

**Fichiers clés** :
- `src/services/photoVerification.service.ts`
- `src/features/habits/components/PhotoCapture.tsx`

**Critères de "done"** :
- L'utilisateur peut prendre une photo pour valider
- L'IA détecte le bon type d'objet
- L'habitude est validée si photo OK

---

### [0016] - Notifications push

**Responsable** : Dev A

**Tâches** :
- [ ] Configurer Expo Notifications
- [ ] Notifications quotidiennes (style Duolingo)
- [ ] Notification de streak en danger
- [ ] Personnaliser selon l'humeur du personnage

**Fichiers clés** :
- `src/services/notifications.service.ts`

**Critères de "done"** :
- L'utilisateur reçoit des rappels quotidiens
- Notifications personnalisées

---

### [0017] - Animations et feedback visuel

**Responsable** : Ensemble

**Tâches** :
- [ ] Animation de level up
- [ ] Confettis à la validation d'habitude
- [ ] Transitions fluides
- [ ] Feedback haptique

**Fichiers clés** :
- `src/components/ui/Animations.tsx`

---

### [0018] - Design system complet

**Responsable** : Ensemble

**Tâches** :
- [ ] Créer les composants UI de base
  - [ ] Button, Input, Card, Badge
  - [ ] ProgressBar, Avatar, Modal
- [ ] Implémenter la palette de couleurs du DA
- [ ] Typographie cohérente
- [ ] Dark mode (optionnel)

**Fichiers clés** :
- `src/components/ui/`

---

### [0019] - Quêtes saisonnières

**Responsable** : Dev B

**Tâches** :
- [ ] Créer la table `quests`
- [ ] Logique de quêtes hebdomadaires/mensuelles
- [ ] Récompenses spéciales

**Fichiers clés** :
- `supabase/migrations/004_quests.sql`
- `src/features/quests/`

---

### [0020] - Tests et stabilisation

**Responsable** : Ensemble

**Tâches** :
- [ ] Tests unitaires (utils, formules)
- [ ] Tests d'intégration (services)
- [ ] Tests E2E (parcours utilisateur)
- [ ] Correction des bugs critiques

---

## 🎯 Tâche en Cours

### [0010] - Système de decay (compétences)

**Sprint actuel** : Phase 3 - Gamification

**Responsable** : Dev A

**Date de début** : 2025-12-27

**Objectif** :
Implémenter un système de decay pour les compétences non pratiquées, encourageant la régularité.

**Tâches à faire** :
- [ ] Créer `src/utils/decayCalculator.ts`
  - [ ] Fonction `checkDecay(domainSkill, currentDate)`
  - [ ] Règle : après 7 jours d'inactivité sur un domaine → decay
  - [ ] Niveau minimum = `currentLevel / 2`
- [ ] Intégrer dans `character.service.ts`
  - [ ] Fonction `applyDecayToAllDomains(characterId)`
- [ ] Appeler au lancement de l'app
- [ ] Afficher un message si decay appliqué

**Fichiers à créer/modifier** :
- `apps/mobile/src/utils/decayCalculator.ts`
- `apps/mobile/src/services/character.service.ts`
- `apps/mobile/app/index.tsx` ou hook d'initialisation

**Critères de "done"** :
- Après 7 jours sans activité sur un domaine, le niveau baisse
- Le niveau ne descend jamais en dessous de la moitié du niveau actuel
- L'utilisateur est notifié du decay

**Prochaine tâche** : [0011] Humeur du personnage

---

## Notes et Décisions

### Priorités

1. **Core Loop d'abord** : tout tourne autour de "valider une habitude → XP → progression"
2. **Mobile-first** : le web est secondaire
3. **Offline-ready** : l'app doit fonctionner sans connexion (WatermelonDB plus tard)

### Dépendances entre tasks

```
[0001] Setup Supabase
  └── [0002] Auth
       └── [0003] Character creation
            └── [0004] Display character
                 └── [0007] XP calculation

[0001] Setup Supabase
  └── [0005] CRUD Habits
       └── [0006] Habit validation
            └── [0007] XP calculation
```

### Règles de travail

1. **Une feature = une branche** (`feature/[XXXX]nom`)
2. **Commit réguliers** avec messages clairs
3. **Tester avant de PR**
4. **Mettre à jour TODO.md** après chaque task complétée
5. **Documenter les décisions** dans TRACE.md

---

## Historique des Complétions

| ID | Feature | Date | Dev | Commit | PR |
|----|---------|------|-----|--------|----|
| 0000 | Initial setup | 2025-12-21 | Claude | b7977d1 | - |
| 0003 | Setup Supabase | 2025-12-21 | Claude | 286dc6d | #1 |
| 0004 | Authentification | 2025-12-21 | Claude | 85630c2 | #2 |
| 0005 | Création personnage | 2025-12-22 | Claude | c9f0d76 | #3 |
| 0006 | Affichage & Dashboard | 2025-12-23 | Claude | b32e9a7 | #4 |
| 0007 | CRUD Habitudes | 2025-12-24 | Claude | 32120f0 | #5 |
| 0008 | Complétion Habitudes | 2025-12-25 | Claude | 5323d8e | #6 |
| 0009 | Système de streak | 2025-12-27 | Claude | 70a3335 | #7 |
| 0010 | Système de decay + Fix XP | 2025-12-27 | Claude | 8d08a30 | #8 |
| 0011 | Humeur du personnage | 2025-12-30 | Claude | 53a69d0 | #9 |
| 0012 | Journal quotidien | 2025-12-30 | Claude | 3051083 | #10 |
| 0013 | Shop basique | 2025-12-30 | Claude | cd0b5f9 | #11 |

---

**Prochaine révision** : Après [0014] (équipement du personnage)
