# TODO - GrowGame

> Roadmap et suivi du développement

**Dernière mise à jour** : 2025-12-21

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
Phase 1 : Backend & Auth                  🔄 EN COURS
Phase 2 : Core Loop MVP                   ⏳ À VENIR
Phase 3 : Gamification                    ⏳ À VENIR
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

## Phase 1 : Backend & Auth 🔄

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

### [0004] - Authentification avec Supabase

**Responsable** : Dev A

**Tâches** :
- [ ] Créer le service `src/services/auth.service.ts`
  - [ ] Fonction `signUp(email, password, characterName)`
  - [ ] Fonction `signIn(email, password)`
  - [ ] Fonction `signOut()`
  - [ ] Fonction `getCurrentUser()`
- [ ] Créer le store `src/stores/authStore.ts`
  - [ ] État `user`, `loading`, `error`
  - [ ] Actions login/logout/signup
- [ ] Implémenter l'écran Login (`app/(auth)/login.tsx`)
- [ ] Implémenter l'écran Register (`app/(auth)/register.tsx`)
- [ ] Créer la logique de redirection (connecté → tabs, déconnecté → auth)
- [ ] Gérer la persistance de session

**Fichiers clés** :
- `src/services/auth.service.ts`
- `src/stores/authStore.ts`
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/index.tsx` (logique de redirection)

**Critères de "done"** :
- Un utilisateur peut créer un compte
- Un utilisateur peut se connecter
- La session persiste au redémarrage de l'app
- Les écrans redirigent correctement

---

### [0005] - Création du personnage au signup

**Responsable** : Dev A

**Tâches** :
- [ ] À l'inscription, créer automatiquement un `character`
- [ ] Initialiser les 5 `domain_skills` à niveau 1
- [ ] Nom du personnage = nom fourni à l'inscription
- [ ] Valeurs par défaut : level 1, 0 XP, 0 coins, humeur neutre

**Fichiers clés** :
- `src/services/character.service.ts`
- `src/stores/authStore.ts` (appeler la création de character)

**Critères de "done"** :
- Après signup, un character est créé en DB
- Les 5 domain_skills sont initialisés

---

## Phase 2 : Core Loop MVP ⏳

**Objectif** : Boucle de jeu de base fonctionnelle

### [0004] - Affichage du personnage

**Responsable** : Dev A

**Tâches** :
- [ ] Créer `src/services/character.service.ts`
  - [ ] `getCharacter(userId)`
  - [ ] `getDomainSkills(characterId)`
- [ ] Créer `src/stores/characterStore.ts`
- [ ] Afficher les stats dans `app/(tabs)/character.tsx`
  - [ ] Nom, niveau global, XP, coins
  - [ ] Liste des 5 domaines avec niveau et XP
  - [ ] Barres de progression XP
- [ ] Afficher l'humeur (emoji)

**Fichiers clés** :
- `src/services/character.service.ts`
- `src/stores/characterStore.ts`
- `app/(tabs)/character.tsx`

**Critères de "done"** :
- L'écran Character affiche les vraies données de la DB
- Les barres de progression sont fonctionnelles

---

### [0005] - CRUD des habitudes

**Responsable** : Dev B

**Tâches** :
- [ ] Créer `src/services/habits.service.ts`
  - [ ] `getHabits(characterId)`
  - [ ] `createHabit(characterId, domain, name, difficulty)`
  - [ ] `updateHabit(habitId, data)`
  - [ ] `deleteHabit(habitId)`
- [ ] Créer `src/stores/habitsStore.ts`
- [ ] Implémenter l'écran `app/(tabs)/habits.tsx`
  - [ ] Liste des habitudes du jour
  - [ ] Bouton "Ajouter une habitude"
  - [ ] Checkbox de complétion (sans validation photo pour l'instant)
- [ ] Modal/écran de création d'habitude
  - [ ] Choix du domaine
  - [ ] Nom de l'habitude
  - [ ] Difficulté (1-3 étoiles)

**Fichiers clés** :
- `src/services/habits.service.ts`
- `src/stores/habitsStore.ts`
- `app/(tabs)/habits.tsx`
- `src/features/habits/components/HabitForm.tsx`

**Critères de "done"** :
- L'utilisateur peut créer/modifier/supprimer des habitudes
- Les habitudes s'affichent dans l'onglet Habits

---

### [0006] - Validation d'habitude (sans photo)

**Responsable** : Dev B

**Tâches** :
- [ ] Créer `src/services/habitLogs.service.ts`
  - [ ] `logHabitCompletion(habitId, photoUrl, xpEarned, coinsEarned)`
- [ ] Implémenter la logique de validation simple (checkbox)
- [ ] Calculer XP et coins selon la difficulté
- [ ] Créer l'entrée dans `habit_logs`
- [ ] Mettre à jour le character (XP, coins)
- [ ] Mettre à jour le domain_skill correspondant
- [ ] Empêcher la validation multiple le même jour

**Fichiers clés** :
- `src/services/habitLogs.service.ts`
- `src/stores/habitsStore.ts`

**Critères de "done"** :
- Cocher une habitude donne XP et coins
- Le personnage monte en XP
- Le domain_skill monte en XP
- On ne peut valider qu'une fois par jour

---

### [0007] - Calcul des niveaux et progression

**Responsable** : Dev A

**Tâches** :
- [ ] Créer `src/utils/xpCalculator.ts`
  - [ ] Utiliser les formules de `constants/game.ts`
  - [ ] `calculateLevelFromXp(xp)`
  - [ ] `getXpProgress(currentXp)`
- [ ] À chaque gain d'XP :
  - [ ] Recalculer le niveau global
  - [ ] Recalculer le niveau du domaine
  - [ ] Vérifier si level up (animation future)
- [ ] Afficher le nouveau niveau en temps réel

**Fichiers clés** :
- `src/utils/xpCalculator.ts`
- `src/services/character.service.ts`

**Critères de "done"** :
- Le niveau monte automatiquement quand l'XP requis est atteint
- Les barres de progression reflètent la bonne valeur

---

### [0008] - Écran d'accueil (Dashboard)

**Responsable** : Ensemble

**Tâches** :
- [ ] Afficher un résumé dans `app/(tabs)/home.tsx`
  - [ ] Nom du personnage + avatar placeholder
  - [ ] Niveau global et XP
  - [ ] Streak actuel
  - [ ] Nombre d'habitudes complétées aujourd'hui
  - [ ] Bouton rapide "Valider une habitude"
- [ ] Créer un composant `CharacterSummary`

**Fichiers clés** :
- `app/(tabs)/home.tsx`
- `src/components/domain/CharacterSummary.tsx`

**Critères de "done"** :
- L'écran Home affiche un dashboard fonctionnel

---

## Phase 3 : Gamification ⏳

**Objectif** : Ajouter les mécaniques de jeu avancées

### [0009] - Système de streak

**Responsable** : Dev B

**Tâches** :
- [ ] Ajouter `last_activity_date` dans `characters`
- [ ] Calculer le streak :
  - [ ] Si activité aujourd'hui → streak continue
  - [ ] Si 1 jour de gap → streak reset
  - [ ] Stocker `current_streak` et `longest_streak`
- [ ] Afficher le streak dans le dashboard
- [ ] Bonus de 7 jours : +10 coins

**Fichiers clés** :
- `src/utils/streakCalculator.ts`
- `src/services/character.service.ts`

**Critères de "done"** :
- Le streak s'incrémente correctement
- Le streak se reset après 1 jour d'inactivité
- Bonus de 7 jours fonctionnel

---

### [0010] - Système de decay (compétences)

**Responsable** : Dev A

**Tâches** :
- [ ] Créer une fonction `checkDecay()`
  - [ ] Vérifier chaque `domain_skill`
  - [ ] Si `last_activity_at` > 7 jours → appliquer decay
  - [ ] Niveau minimum = `currentLevel / 2`
- [ ] Appeler `checkDecay()` au lancement de l'app
- [ ] Afficher un message si decay appliqué

**Fichiers clés** :
- `src/utils/decayCalculator.ts`
- `src/services/character.service.ts`

**Critères de "done"** :
- Après 7 jours d'inactivité, le niveau du domaine baisse
- Le niveau ne descend jamais en dessous de la moitié

---

### [0011] - Humeur du personnage

**Responsable** : Dev A

**Tâches** :
- [ ] Logique de calcul de l'humeur :
  - [ ] Happy : streak > 7 jours
  - [ ] Neutral : activité régulière
  - [ ] Tired : 2 jours consécutifs sans activité
  - [ ] Sad : 3+ jours consécutifs sans activité
- [ ] Afficher l'emoji de l'humeur
- [ ] (Optionnel) Modifier l'apparence du personnage

**Fichiers clés** :
- `src/utils/moodCalculator.ts`
- `app/(tabs)/character.tsx`

**Critères de "done"** :
- L'humeur change selon l'activité
- Visuellement représenté (emoji minimum)

---

### [0012] - Journal quotidien

**Responsable** : Dev B

**Tâches** :
- [ ] Créer une table `journal_entries`
- [ ] Modal de saisie du journal après validation d'habitude
- [ ] +5 XP pour complétion du journal
- [ ] Optionnel mais encouragé

**Fichiers clés** :
- `supabase/migrations/002_journal.sql`
- `src/features/journal/components/JournalModal.tsx`

**Critères de "done"** :
- L'utilisateur peut écrire un journal
- +5 XP bonus si journal rempli

---

## Phase 4 : Shop & Cosmétiques ⏳

**Objectif** : Récompenses visuelles

### [0013] - Shop basique

**Responsable** : Dev A

**Tâches** :
- [ ] Peupler la table `shop_items` avec des items de base
- [ ] Créer `src/services/shop.service.ts`
  - [ ] `getShopItems()`
  - [ ] `purchaseItem(userId, itemId, price)`
- [ ] Implémenter `app/(tabs)/shop.tsx`
  - [ ] Grille d'items avec prix
  - [ ] Vérifier les coins avant achat
  - [ ] Ajouter l'item à `user_items`

**Fichiers clés** :
- `supabase/migrations/003_shop_items.sql`
- `src/services/shop.service.ts`
- `app/(tabs)/shop.tsx`

**Critères de "done"** :
- L'utilisateur peut acheter des items avec ses coins
- Les items achetés apparaissent dans son inventaire

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

### [0004] - Authentification avec Supabase

**Sprint actuel** : Phase 1 - Backend & Auth

**Responsable** : Dev A

**Date de début** : 2025-12-21 (à venir)

**Objectif** :
Implémenter l'authentification complète (inscription, connexion, déconnexion) avec Supabase.

**Tâches à faire** :
- [ ] Créer le service d'authentification (`src/services/auth.service.ts`)
- [ ] Créer le store Zustand pour l'auth (`src/stores/authStore.ts`)
- [ ] Implémenter l'écran Login fonctionnel
- [ ] Implémenter l'écran Register fonctionnel
- [ ] Gérer la persistance de session
- [ ] Implémenter la logique de redirection (auth vs tabs)

**Fichiers à créer/modifier** :
- `src/services/auth.service.ts`
- `src/stores/authStore.ts`
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/index.tsx`

**Critères de "done"** :
- Un utilisateur peut créer un compte
- Un utilisateur peut se connecter
- La session persiste au redémarrage
- Redirection automatique selon l'état de connexion

**Prochaine tâche** : [0005] Création du personnage au signup

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

| ID | Feature | Date | Dev | Commit |
|----|---------|------|-----|--------|
| 0000 | Initial setup | 2025-12-21 | Claude | b7977d1 |

---

**Prochaine révision** : Après [0003] (création de personnage)
