# TRACE - GrowGame

> Historique des décisions techniques et modifications importantes

**Dernière mise à jour** : 2026-02-02

---

## Table des Matières

- [Phase 0 - Setup](#phase-0---setup)
- [Phase 1 - Backend & Auth](#phase-1---backend--auth)
- [Phase 2 - Core Loop MVP](#phase-2---core-loop-mvp)
- [Phase 3 - Gamification](#phase-3---gamification)
- [Phase 4 - Social & Polish](#phase-4---social--polish)
- [Décisions Techniques](#décisions-techniques)
- [Problèmes Rencontrés](#problèmes-rencontrés)

---

## Phase 0 - Setup

### [2025-12-21] Initial Setup

**Commit**: `b7977d1`

**Actions**:
- Initialisation projet Expo + TypeScript
- Configuration Expo Router pour la navigation
- Structure de base des dossiers (`app/`, `src/`)
- Configuration Git et GitHub
- Documentation initiale (ARCHITECTURE, SETUP)

**Stack Technique**:
- React Native + Expo SDK 54
- TypeScript
- Expo Router (file-based routing)
- Zustand (state management)

---

## Phase 1 - Backend & Auth

### [2025-12-21] [0003] Setup Supabase

**Commit**: `286dc6d` | **PR**: #1

**Actions**:
- Création du projet Supabase
- Configuration `.env` avec URLs et clés
- Migration initiale du schéma de base de données

**Fichiers créés**:
- `supabase/migrations/001_initial_schema.sql`
- `apps/mobile/src/services/supabase.ts`

**Tables créées**:
```sql
- characters (nom, level, xp, coins, humeur, streak, etc.)
- domain_skills (5 domaines: études, sport, méditation, lecture, étirements)
- habits (nom, domaine, difficulté, récurrence)
- habit_logs (complétion, photo, XP/coins gagnés)
- shop_items (items cosmétiques)
- user_items (inventaire)
- equipments (items équipés)
```

**RLS activé** sur toutes les tables pour la sécurité.

---

### [2025-12-21] [0004] Authentification

**Commit**: `85630c2` | **PR**: #2

**Actions**:
- Implémentation service d'authentification
- Store Zustand pour gérer l'état auth
- Écrans Login et Register
- Logique de redirection (auth → tabs)
- Persistance de session

**Fichiers créés**:
- `apps/mobile/src/services/auth.service.ts`
- `apps/mobile/src/stores/authStore.ts`
- `apps/mobile/app/(auth)/login.tsx`
- `apps/mobile/app/(auth)/register.tsx`

**Décision Technique**:
Utilisation de `supabase.auth.onAuthStateChange()` pour la persistance automatique de session au lieu de gérer manuellement les tokens.

**Bugs Corrigés**:
- **Navigation**: Fix logout redirect et back navigation (commit `2f9b49f`)
- **Web Compatibility**: Ajout d'une utility `alert` cross-platform (commit `a5213a0`)
- **Build**: Ajout `babel.config.js` pour react-native-reanimated (commit `8c06dca`)
- **Dependencies**: Installation `react-native-worklets-core` (commit `d4cbb32`)

---

### [2025-12-22] [0005] Création du Personnage

**Commit**: `c9f0d76` | **PR**: #3

**Actions**:
- Création automatique du character au signup
- Initialisation des 5 domain_skills à niveau 1
- Intégration dans le flow d'inscription

**Fichiers modifiés**:
- `apps/mobile/src/services/character.service.ts` (fonction `createCharacter`)
- `apps/mobile/src/stores/authStore.ts` (appel lors du signup)

**Logique**:
```typescript
// Au signup:
1. Créer le user avec Supabase Auth
2. Créer automatiquement un character lié au user
3. Initialiser les 5 domain_skills à niveau 1, XP 0
4. Valeurs par défaut: level 1, 0 XP, 0 coins, humeur neutre
```

---

## Phase 2 - Core Loop MVP

### [2025-12-23] [0006] Affichage du Personnage & Dashboard

**Commit**: `b32e9a7` | **PR**: #4

**Actions**:
- Service character avec `getCharacter()` et `getDomainSkills()`
- Store Zustand pour le character
- Écran Home avec dashboard complet
- Calcul automatique des niveaux depuis l'XP
- Barres de progression XP

**Fichiers créés**:
- `apps/mobile/src/stores/characterStore.ts`
- `apps/mobile/src/utils/xpCalculator.ts`

**Fichiers modifiés**:
- `apps/mobile/app/(tabs)/home.tsx` (dashboard complet)

**Formule XP → Level**:
```typescript
XP requis pour level N = (N - 1) * 100
Exemple:
- Level 1 → 2: 100 XP
- Level 2 → 3: 200 XP
- Level 3 → 4: 300 XP
```

**Bugs Corrigés**:
- **XP Calculation**: Fix calcul XP pour level 1 (commit `134438b`)
- **Dependencies**: Upgrade dependencies (commit `134438b`)

---

### [2025-12-24] [0007] CRUD des Habitudes

**Commit**: `32120f0` | **PR**: #5

**Actions**:
- Service habits avec CRUD complet
- Store Zustand pour les habitudes
- Écran de gestion des habitudes
- Formulaire de création/édition

**Fichiers créés**:
- `apps/mobile/src/services/habits.service.ts`
- `apps/mobile/src/stores/habitsStore.ts`
- `apps/mobile/app/(tabs)/habits/index.tsx`
- `apps/mobile/app/(tabs)/habits/new.tsx`

**Fonctionnalités**:
- Créer une habitude (nom, domaine, difficulté)
- Modifier une habitude existante
- Supprimer une habitude
- Lister toutes les habitudes

**Difficultés**:
```typescript
'facile'     → 10 XP, 1 coin
'moyen'      → 20 XP, 2 coins
'difficile'  → 30 XP, 3 coins
```

---

### [2025-12-25] [0008] Complétion des Habitudes

**Commit**: `5323d8e` | **PR**: #6

**Actions**:
- Service habitLogs pour la complétion
- Logique de toggle (cocher/décocher)
- Calcul et attribution XP/coins
- Update character et domain_skills via RPC
- Prévention des doublons (1 fois par jour)

**Fichiers créés**:
- `apps/mobile/src/services/habitLogs.service.ts`
- `supabase/migrations/002_habit_log_trigger.sql`

**Migration 002 - Trigger**:
```sql
-- Trigger pour mettre à jour last_activity_date automatiquement
CREATE OR REPLACE FUNCTION update_last_activity_date()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE characters
  SET last_activity_date = CURRENT_DATE, updated_at = NOW()
  WHERE id = (SELECT character_id FROM habits WHERE id = NEW.habit_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habit_log_update_activity
  AFTER INSERT ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity_date();
```

**RPC Functions**:
```sql
-- add_character_rewards: ajoute XP et coins
-- add_domain_skill_xp: ajoute XP au domaine spécifique
```

**Flow de Complétion**:
```
1. Vérifier si déjà complété aujourd'hui
2. Calculer XP et coins selon difficulté
3. Créer habit_log
4. Update character (XP global, coins)
5. Update domain_skill (XP du domaine)
6. Trigger met à jour last_activity_date
```

---

## Phase 3 - Gamification

### [2025-12-27] [0009] Système de Streak

**Commit**: `70a3335` | **PR**: #7

**Actions**:
- Utilitaire de calcul de streak
- Intégration avec complétion d'habitudes
- Bonus aux milestones (7, 14, 30, 60, 100 jours)
- Affichage dans le dashboard

**Fichiers créés**:
- `apps/mobile/src/utils/streakCalculator.ts`

**Fichiers modifiés**:
- `apps/mobile/src/services/character.service.ts` (`updateStreak`)
- `apps/mobile/src/services/habitLogs.service.ts` (intégration)

**Logique de Streak**:
```typescript
// Règles:
- Si lastActivityDate est null → streak = 1
- Si lastActivityDate est aujourd'hui → pas de changement
- Si lastActivityDate est hier → streak += 1
- Si gap > 1 jour → streak reset à 1

// Bonus coins aux milestones:
7 jours   → +10 coins
14 jours  → +25 coins
30 jours  → +50 coins
60 jours  → +100 coins
100 jours → +200 coins
```

**Problèmes Rencontrés et Solutions**:

#### Bug #1: Race Condition avec Trigger
**Problème**: Le streak ne s'incrémentait pas car le trigger DB mettait à jour `last_activity_date` AVANT que `updateStreak()` ne lise la valeur.

**Solution** (commit `e478169`):
```typescript
// Lire les valeurs du character AVANT de créer le habit_log
const character = await supabase.from('characters')
  .select('current_streak, longest_streak, last_activity_date')
  .eq('id', characterId)
  .single();

// Créer le log (trigger met à jour last_activity_date)
await createHabitLog(...);

// Passer les anciennes valeurs à updateStreak()
await updateStreak(characterId, {
  lastActivityDate: character.last_activity_date,
  currentStreak: character.current_streak,
  longestStreak: character.longest_streak
});
```

#### Bug #2: Streak=0 avec Activité du Même Jour
**Problème**: Quand `currentStreak = 0` mais `lastActivityDate = aujourd'hui` (plusieurs habitudes complétées le même jour), le streak restait à 0.

**Solution** (commit `91b11ea`):
```typescript
// Dans streakCalculator.ts
if (daysDifference === 0) {
  // Si streak est 0, c'est la première activité de la séquence
  if (currentStreak === 0) {
    return { currentStreak: 1, ... };
  }
  // Sinon, pas de changement
  return { currentStreak, ... };
}
```

**Tests Validés**:
- ✅ Streak passe de 0 à 1 à la première complétion
- ✅ Streak reste à 1 si plusieurs habitudes le même jour
- ✅ Calcul correct (intégré dans le code TypeScript)

---

## Décisions Techniques

### Architecture

**Monorepo Structure**:
```
GrowGame/
├── apps/
│   └── mobile/          # Application React Native
├── supabase/
│   └── migrations/      # Migrations SQL
└── doc/                 # Documentation du projet
```

**State Management**: Zustand
- Plus simple que Redux
- TypeScript-first
- Pas de boilerplate
- Store par domaine (auth, character, habits)

**Backend**: Supabase
- Auth intégrée
- PostgreSQL + RLS
- Real-time capabilities (future)
- File storage (future pour photos)

**Formules de jeu**:
- XP par level: `(level - 1) * 100`
- XP par difficulté: facile=10, moyen=20, difficile=30
- Coins par difficulté: facile=1, moyen=2, difficile=3

### Navigation

**Expo Router (file-based)**:
```
app/
├── (auth)/              # Stack non-authentifié
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/              # Tabs authentifiées
│   ├── home.tsx
│   ├── habits/
│   ├── character.tsx
│   └── shop.tsx
└── index.tsx            # Point d'entrée avec redirection
```

### Base de Données

**RLS (Row Level Security)**:
- Chaque user ne peut accéder qu'à ses propres données
- Politique: `auth.uid() = user_id`

**Triggers**:
- Auto-update de `last_activity_date` à chaque complétion
- Évite les appels manuels

**RPC Functions**:
- Atomicité des opérations complexes
- `add_character_rewards(characterId, xp, coins)`
- `add_domain_skill_xp(characterId, domain, xp)`

---

## Problèmes Rencontrés

### 1. React Native Reanimated Build Error

**Problème**: Erreur de bundler au démarrage de l'app
```
Unable to resolve module react-native-reanimated
```

**Solution** (commit `8c06dca`):
- Ajout de `babel.config.js` avec plugin reanimated
- Installation de `react-native-worklets-core`

---

### 2. Navigation Logout Redirect

**Problème**: Après logout, l'app ne redirige pas vers login

**Solution** (commit `2f9b49f`):
- Utilisation de `router.replace('/login')` au lieu de `navigate`
- Gestion correcte du stack navigation

---

### 3. Web Compatibility - Alert

**Problème**: `Alert.alert()` n'existe pas sur le web

**Solution** (commit `a5213a0`):
- Création d'une utility `showAlert()` cross-platform
- Utilise `Alert` sur mobile, `window.alert()` sur web

---

### 4. Race Condition - Streak Update

**Problème**: Trigger DB met à jour `last_activity_date` avant la lecture du streak

**Solution** (commit `e478169`):
- Lecture des valeurs AVANT création du log
- Passage explicite des valeurs à `updateStreak()`

---

### 5. Streak=0 avec Même Jour

**Problème**: Plusieurs complétions le même jour ne démarrent pas le streak

**Solution** (commit `91b11ea`):
- Vérification spéciale: si `daysDifference === 0` ET `currentStreak === 0`
- Alors démarrer le streak à 1

---

### [2025-12-27] [0010] Système de Decay + Bug Fix XP

**Commit**: `8d08a30` | **PR**: #8

**Actions**:
- Implémentation du decay des compétences après 7 jours d'inactivité
- Correction du bug d'affichage des barres de progression XP
- Notification de decay à l'utilisateur

**Fichiers créés**:
- `apps/mobile/src/utils/decayCalculator.ts`

**Fichiers modifiés**:
- `apps/mobile/src/services/character.service.ts` (`applyDecayToAllDomains`)
- `apps/mobile/src/stores/characterStore.ts` (intégration decay check)
- `apps/mobile/app/(tabs)/home.tsx` (alerte decay)
- `apps/mobile/src/components/XPProgressBar.tsx` (bug fix)
- `apps/mobile/src/components/DomainSkillCard.tsx` (bug fix)

**Logique de Decay**:
```typescript
// Règles:
- Si last_activity_at est null → pas de decay (jamais pratiqué)
- Si last_activity_at < 7 jours → pas de decay
- Si last_activity_at >= 7 jours → decay appliqué
  - Nouveau niveau = max(1, floor(currentLevel / 2))
  - XP recalculé = (newLevel - 1) * 100

// Exemple:
Niveau 4 (400 XP) → 8 jours sans activité → Niveau 2 (100 XP)
Niveau 3 (200 XP) → 8 jours sans activité → Niveau 1 (0 XP)
```

**Flow de Decay**:
```
1. Au chargement du character (characterStore.loadCharacter)
2. Appel de applyDecayToAllDomains(characterId)
3. Pour chaque domain_skill:
   - Calculer daysInactive depuis last_activity_at
   - Si >= 7 jours → appliquer decay
4. Si decay appliqué:
   - Recharger les skills
   - Afficher message de notification
5. Utilisateur voit l'alerte avec détails des compétences déclinées
```

**Problèmes Rencontrés et Solutions**:

#### Bug Fix: Barres de Progression XP Incorrectes
**Problème**: Les barres de progression affichaient des valeurs incorrectes. Par exemple, avec 150 XP au niveau 1, l'affichage montrait "150/50 XP" au lieu de "100/150 XP".

**Cause**: Les composants utilisaient `xpForLevel(currentLevel)` comme cible, alors qu'il fallait utiliser `xpForLevel(currentLevel + 1)`.

**Solution** (commit `8d08a30`):
```typescript
// Avant (incorrect):
const xpNeeded = xpForLevel(skill.level); // 50 pour level 1
const xpForCurrentLevel = skill.level > 1 ? xpForLevel(skill.level - 1) : 0;

// Après (correct):
const xpAtCurrentLevel = xpForLevel(skill.level); // XP au début du niveau
const xpAtNextLevel = xpForLevel(skill.level + 1); // XP pour le niveau suivant
const xpInThisLevel = Math.max(0, skill.xp - xpAtCurrentLevel);
const xpNeededForNextLevel = xpAtNextLevel - xpAtCurrentLevel;
```

**Formule XP rappel**:
```
xpForLevel(n) = (100 * n²) / 2
- Niveau 1: 0-199 XP (nécessite 200 XP pour passer niveau 2)
- Niveau 2: 200-449 XP (nécessite 450 XP pour passer niveau 3)
- Niveau 3: 450-799 XP (nécessite 800 XP pour passer niveau 4)
```

---

### [2025-12-30] [0011] Humeur du Personnage

**Commit**: `53a69d0` | **PR**: #9

**Actions**:
- Implémentation du système d'humeur dynamique basé sur l'activité
- Ajout du mood 'sad' au type Mood
- Mise à jour automatique après complétion ou au chargement

**Fichiers créés**:
- `apps/mobile/src/utils/moodCalculator.ts`

**Fichiers modifiés**:
- `apps/mobile/src/types/index.ts` (ajout 'sad' au type Mood)
- `apps/mobile/src/constants/game.ts` (ajout emoji sad 😢)
- `apps/mobile/src/services/character.service.ts` (`updateMood`)
- `apps/mobile/src/services/habitLogs.service.ts` (appel updateMood)
- `apps/mobile/src/stores/characterStore.ts` (intégration updateMood)
- `apps/mobile/app/(tabs)/home.tsx` (affichage mood card)

**Logique de Mood**:
```typescript
// Règles (par priorité):
1. Sad 😢: 3+ jours sans activité (priorité la plus haute)
2. Tired 😴: 2 jours sans activité
3. Happy 😊: streak >= 7 jours ET actif dans les dernières 24h
4. Neutral 😐: défaut

// Exemples:
- Streak de 10 jours + actif aujourd'hui → Happy 😊
- Streak de 5 jours + actif aujourd'hui → Neutral 😐
- Dernière activité il y a 2 jours → Tired 😴
- Dernière activité il y a 5 jours → Sad 😢
```

**Flow de Mood Update**:
```
1. Après complétion d'habitude (habitLogs.service):
   - completeHabit() → updateStreak() → updateMood() → nouveau mood calculé

2. Au chargement du character (characterStore):
   - loadCharacter() → applyDecay() → updateMood() → reload character pour mood

3. Calcul du mood (moodCalculator):
   - Analyse current_streak et last_activity_date
   - Retourne {mood, reason}
   - updateMood() met à jour en DB si changement
```

**Affichage**:
- Nouvelle carte "Mood" sur home.tsx
- Affiche emoji 48px + description
- Messages contextuels selon le mood

---

### [2025-12-30] [0012] Journal Quotidien

**Commit**: `3051083` | **PR**: #10

**Actions**:
- Implémentation du système de journal quotidien optionnel
- Modal affiché après complétion d'habitude
- Bonus de +5 XP pour écriture de journal
- Stockage des entrées liées aux habit_logs

**Fichiers créés**:
- `supabase/migrations/004_journal_entries.sql`
- `apps/mobile/src/services/journal.service.ts`
- `apps/mobile/src/components/JournalPromptModal.tsx`

**Fichiers modifiés**:
- `apps/mobile/src/types/index.ts` (ajout type JournalEntry)
- `apps/mobile/src/stores/habitsStore.ts` (état modal)
- `apps/mobile/app/(tabs)/habits.tsx` (intégration modal)

**Schéma Database**:
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  habit_log_id UUID REFERENCES habit_logs(id), -- Optionnel
  entry_text TEXT NOT NULL CHECK (char_length(entry_text) <= 1000),
  mood TEXT CHECK (mood IN ('happy', 'neutral', 'tired', 'sad')),
  xp_earned INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- RLS policies: users can only access their own journal entries
-- Update/Delete allowed within 24h only
```

**Logique de Journal**:
```typescript
// Flow après complétion d'habitude:
1. Habit complété → XP/coins attribués
2. JournalPromptModal affiché
3. User peut:
   - Écrire une entrée (max 1000 chars) → +5 XP bonus
   - Skip sans pénalité

// Services disponibles:
- createJournalEntry(characterId, entryText, habitLogId, mood)
- getJournalEntries(characterId, limit=30)
- getTodayJournalEntries(characterId)

// Bonus XP:
- JOURNAL_XP_REWARD = 5 XP
- Attribué via add_character_rewards RPC
```

**Fonctionnalités**:
- Modal optionnel avec TextInput multiline
- Compteur de caractères (0/1000)
- Boutons "Passer" et "Enregistrer"
- Optional mood capture (non utilisé dans modal actuel)
- Link vers habit_log qui a déclenché l'entrée
- RLS policies: modification possible dans les 24h seulement

**Future Enhancement**:
Vue historique du journal dans character screen avec affichage des entrées, habitudes associées et dates.

---

### [2025-12-30] [0013] Shop Basique

**Commit**: `cd0b5f9` | **PR**: #11

**Actions**:
- Implémentation du système de boutique
- Catalogue d'items avec cosmétiques, décorations et jokers
- Système d'achat avec validation de coins
- Gestion de l'inventaire utilisateur

**Fichiers créés**:
- `supabase/migrations/005_populate_shop_items.sql`
- `apps/mobile/src/services/shop.service.ts`
- `apps/mobile/src/stores/shopStore.ts`

**Fichiers modifiés**:
- `apps/mobile/app/(tabs)/shop.tsx` (refonte complète)
- `apps/mobile/src/stores/authStore.ts` (clear shop on logout)

**Migration 005 - Shop Items**:
Ajout de 34 items variés :
- **Cosmétiques** (25 items) : 5 slots (couvre_chef, haut, bas, chaussures, accessoire)
  - Rareté variée : Common (50-120 coins), Rare (150-300), Epic (350-500), Legendary (800-1200)
- **Décorations** (6 items) : Trophées, plantes, affiches, statues
- **Jokers** (3 items) : Protection streak, double XP

**Services créés**:
```typescript
// shop.service.ts
- getShopItems(): Fetch tous les items disponibles
- getShopItemsByType(type): Filtrer par cosmetic/decoration/joker
- getUserItems(userId): Inventaire avec détails des items
- userOwnsItem(userId, itemId): Check ownership
- purchaseItem({userId, itemId, characterId}): Achat avec validation

// Helpers de transformation
- transformShopItem(): snake_case DB → camelCase TypeScript
- transformUserItem(): Conversion pour inventaire
```

**Store Zustand**:
```typescript
// shopStore.ts
- State: shopItems, userItems, isLoading, isPurchasing, error
- loadShopItems(): Charge le catalogue
- loadUserItems(userId): Charge l'inventaire
- buyItem(): Effectue un achat avec refresh auto
- userOwnsItem(itemId): Check local ownership
- clearShop(): Nettoyage sur logout
```

**Interface Utilisateur**:
```typescript
// shop.tsx
- Header avec balance de coins en temps réel
- Filter tabs: All, Cosmétiques, Décorations, Jokers
- Grid 2 colonnes avec item cards:
  * Rarity badge (couleur selon rareté)
  * Nom, description, slot
  * Prix en coins
  * Boutons contextuels:
    - "Acheter" si peut se permettre
    - "Trop cher" si pas assez de coins
    - "✓ Possédé" si déjà acheté
- Confirmation d'achat avec dialog
- Loading overlay pendant achat
- Refresh auto des coins après achat
```

**Flow d'achat**:
```
1. User clique "Acheter" sur un item
2. Validation client:
   - Check si déjà possédé → Alert "Déjà possédé"
   - Check coins suffisants → Alert "Pas assez"
3. Confirmation dialog
4. purchaseItem() côté serveur:
   - Fetch item details
   - Re-check ownership en DB
   - Fetch character coins
   - Validate coins >= price
   - Deduct coins (atomic update)
   - Add to user_items
   - Rollback si erreur
5. Reload inventory
6. Refresh character pour update coins display
7. Alert "Achat réussi"
```

**Problèmes Résolus**:

#### Bug: Prix non affichés
**Cause**: Mismatch snake_case (DB) vs camelCase (TypeScript)
- DB retourne `price_coins`, code accède `priceCoins`

**Solution** (commit `62271ea`):
- Ajout fonctions de transformation dans service
- `transformShopItem()` convertit tous les champs
- Application sur tous les endpoints

**Décisions Techniques**:
- **Transformation layer**: Services transforment DB → TS types
- **Optimistic UI**: Pas de rafraîchissement pessimiste
- **Local ownership check**: Évite appels DB inutiles
- **Atomic operations**: Coins déduction + item add
- **Error handling**: Rollback automatique si échec partiel

---

### [2025-12-30] [0014] Équipement du Personnage

**Commits**: `dc52a72`, `9f43d8b` | **PR**: TBD

**Actions**:
- Implémentation complète du système d'équipement
- Gestion des slots d'équipement (5 slots pour cosmétiques)
- Interface de gestion avec modal par slot
- Intégration avec la boutique (équipement direct)
- Refonte de l'écran personnage avec données réelles

**Fichiers créés**:
- `apps/mobile/src/services/equipment.service.ts`
- `apps/mobile/src/components/EquipmentModal.tsx`

**Fichiers modifiés**:
- `apps/mobile/src/stores/characterStore.ts` (ajout equipment state)
- `apps/mobile/app/(tabs)/character.tsx` (refonte complète)
- `apps/mobile/app/(tabs)/shop.tsx` (bouton équiper)

**Service Equipment**:
```typescript
// equipment.service.ts
- getEquippedItems(characterId): Fetch avec JOIN shop_items
- getAvailableItemsForSlot(userId, slot): Items possédés par slot
- equipItem({characterId, itemId, userId}):
  * Validation type === 'cosmetic'
  * Validation ownership dans user_items
  * UPSERT avec onConflict(character_id, slot)
- unequipItem(characterId, slot): DELETE du slot

// Helpers de transformation
- transformEquipment(): snake_case → camelCase
- transformShopItem(): Réutilise la logique shop
```

**Store Updates**:
```typescript
// characterStore.ts - Ajouts
- State:
  * equipment: (Equipment & { shop_item: ShopItem })[]
  * isLoadingEquipment: boolean
- Actions:
  * loadEquipment(characterId): Charge les items équipés
  * equipItem(characterId, itemId, userId): Équipe avec reload
  * unequipItem(characterId, slot): Déséquipe avec reload
  * clearEquipment(): Nettoyage sur logout
```

**Equipment Modal** (`EquipmentModal.tsx`):
```typescript
- Props: visible, slot, currentEquipment, characterId, userId
- Actions: onClose, onEquip, onUnequip
- UI:
  * Header avec slot emoji + nom
  * Bouton "❌ Retirer" si équipé
  * FlatList des items disponibles pour le slot
    - Rarity badge coloré
    - Nom + description
    - Item actuellement équipé indiqué
    - Bouton "Équiper" par item
  * État vide: "Achète des items dans la boutique !"
- Pattern: Suit JournalPromptModal.tsx
```

**Character Screen Refonte**:
```typescript
// character.tsx - Changements majeurs
AVANT: Placeholder avec données statiques
APRÈS: Données dynamiques du characterStore

- Connexion stores: useAuthStore, useCharacterStore
- useEffect: loadCharacter + loadEquipment au mount
- Section Avatar: Humeur avec emoji dynamique
- Section Stats: Niveau/XP/Coins depuis character
- Section Équipement (NOUVEAU):
  * 5 slots en grille verticale
  * Par slot:
    - Emoji + nom du slot
    - Si équipé: nom item + rarity badge
    - Si vide: "Aucun équipement"
    - Bouton "Gérer" → ouvre EquipmentModal
- Section Domain Skills: Calcul XP correct avec xpForLevel()
- Equipment Modal intégré avec gestion state local
```

**Shop Integration**:
```typescript
// shop.tsx - Amélioration UX
- Import equipItem du characterStore
- handleEquip(item): Équipe direct depuis shop
- Logique renderShopItem:
  * Si owned && isCosmetic → Bouton "⚡ Équiper" (violet)
  * Sinon → Bouton "Acheter" ou "✓ Possédé"
- Alert "Item équipé !" après équipement réussi
```

**Pattern UPSERT**:
```sql
-- Atomic slot replacement
INSERT INTO equipments (character_id, slot, item_id)
VALUES ($1, $2, $3)
ON CONFLICT (character_id, slot)
DO UPDATE SET item_id = EXCLUDED.item_id
```

**Validation Ownership**:
```typescript
// Vérification côté serveur
1. Check item existe et type === 'cosmetic'
2. Check user possède item (user_items.user_id + item_id)
3. Si validation OK → UPSERT
4. Sinon → Error "You do not own this item"
```

**Décisions Techniques**:
- **Store unique**: Equipment dans characterStore plutôt que store séparé
  * Raison: Équipements sont des attributs du personnage
- **Modal vs Screen**: Modal pour sélection rapide
  * Raison: Action contextuelle, pas de navigation lourde
- **UPSERT pattern**: Garantit un seul item par slot
  * Raison: Évite race conditions, opération atomique
- **Transformation layer**: Consistency avec shop.service.ts
- **Eager loading**: Equipment chargé avec character
- **Shop integration**: Équipement direct pour meilleure UX

**Flow d'équipement**:
```
Option 1 - Depuis Character Screen:
1. Click "Gérer" sur un slot
2. Modal s'ouvre avec items disponibles
3. Click "Équiper" sur un item
4. equipItem() côté serveur (validation + UPSERT)
5. Reload equipment
6. Modal se ferme
7. Item visible dans le slot

Option 2 - Depuis Shop (cosmétiques possédés):
1. Click "⚡ Équiper" sur item cosmétique possédé
2. equipItem() direct (validation + UPSERT)
3. Alert "Item équipé !"
4. Visible immédiatement sur Character screen

Déséquipement:
1. Click "Gérer" sur slot équipé
2. Click "❌ Retirer l'équipement"
3. unequipItem() DELETE le slot
4. Slot affiche "Aucun équipement"
```

**Tests Manuels - Tous Passés**:
- ✅ Chargement des 5 slots d'équipement
- ✅ Achat + équipement depuis shop
- ✅ Équipement via modal sur character screen
- ✅ Remplacement d'item dans un slot (UPSERT)
- ✅ Déséquipement d'un item
- ✅ Items non-cosmétiques (déco, jokers) non équipables
- ✅ État vide si aucun item pour un slot
- ✅ Rarity badges avec couleurs correctes
- ✅ Validation ownership côté serveur

**Améliorations Futures** (Hors Scope):
- Visual character preview avec items (sprite/avatar)
- Equipment sets avec bonus stats
- Item upgrade system
- Equipment trading

---

## Architecture Évolutive

### Services
Chaque domaine métier a son service:
- `auth.service.ts` - Authentification
- `character.service.ts` - Gestion du personnage
- `habits.service.ts` - CRUD habitudes
- `habitLogs.service.ts` - Complétion et historique
- `shop.service.ts` - Catalogue et achats
- `equipment.service.ts` - Gestion équipement
- `journal.service.ts` - Journal quotidien
- `storage.service.ts` - Upload photos Supabase Storage
- `photoVerification.service.ts` - Vérification IA (Google Vision)
- `quest.service.ts` - Quêtes et achievements
- `notification.service.ts` - Notifications locales
- `leaderboard.service.ts` - Classements ranked
- `statistics.service.ts` - Statistiques agrégées

### Stores (Zustand)
Un store par domaine d'état:
- `authStore.ts` - User, session
- `characterStore.ts` - Character, domain_skills, equipment, notifications
- `habitsStore.ts` - Habits, today's logs, journal prompt
- `shopStore.ts` - Shop items, user inventory
- `questStore.ts` - Daily quests, achievements

### Utils
Logique métier pure (sans dépendances):
- `xpCalculator.ts` - Formules XP → Level
- `streakCalculator.ts` - Logique de streak
- `decayCalculator.ts` - Logique de decay
- `moodCalculator.ts` - Calcul de l'humeur

### Components
- `XPProgressBar.tsx` - Barre XP animée (reanimated)
- `DomainSkillCard.tsx` - Carte compétence domaine
- `HabitCard.tsx` - Carte habitude
- `HabitForm.tsx` - Formulaire habitude
- `JournalPromptModal.tsx` - Modal journal
- `CompletionModeModal.tsx` - Choix Normal/Ranked
- `PhotoCaptureModal.tsx` - Capture photo ranked
- `EquipmentModal.tsx` - Gestion équipement
- `QuestCard.tsx` - Carte quête/achievement
- `QuestRewardModal.tsx` - Réclamer récompenses
- `LeaderboardCard.tsx` - Ligne classement (animée)
- `XPToast.tsx` - Toast XP flottant (event emitter)

---

## Phase 4 - Social & Polish

### [2025-12-31] [0015] Mode Ranked avec Vérification Photo

**Commit**: `e622638` | **PR**: #13

**Actions**:
- Mode de complétion ranked avec prise de photo obligatoire
- Upload photo vers Supabase Storage
- Vérification IA via Google Cloud Vision API
- XP ranked séparé (ranked_level, ranked_xp sur characters)
- Modal de sélection Normal/Ranked, modal de capture photo

**Fichiers créés**:
- `supabase/migrations/006_ranked_mode.sql`
- `apps/mobile/src/services/storage.service.ts`
- `apps/mobile/src/services/photoVerification.service.ts`
- `apps/mobile/src/components/CompletionModeModal.tsx`
- `apps/mobile/src/components/PhotoCaptureModal.tsx`

**Fichiers modifiés**:
- `apps/mobile/src/services/habitLogs.service.ts` (ajout `completeHabitWithMode`)
- `apps/mobile/src/stores/habitsStore.ts` (ajout `completeHabitRanked`)
- `apps/mobile/src/types/index.ts` (ajout `CompletionMode`)
- `apps/mobile/app/(tabs)/habits.tsx` (intégration modals)

**Migration 006**:
```sql
-- Ajout champs ranked au character
ALTER TABLE characters ADD COLUMN ranked_level INTEGER DEFAULT 1;
ALTER TABLE characters ADD COLUMN ranked_xp INTEGER DEFAULT 0;

-- Ajout completion_mode aux habit_logs
ALTER TABLE habit_logs ADD COLUMN completion_mode TEXT DEFAULT 'normal';

-- RPC add_ranked_xp: incrémente ranked_xp et recalcule ranked_level
```

**Rewards Ranked** (multiplicateur 1.5x):
```
Difficulté 1: 15 XP ranked
Difficulté 2: 30 XP ranked
Difficulté 3: 45 XP ranked
```

**Flow Ranked**:
```
1. Clic sur checkbox habitude → Modal Normal/Ranked
2. Si Ranked → Modal capture photo (expo-image-picker)
3. Upload photo vers Supabase Storage
4. Vérification IA (Google Cloud Vision)
5. Si valide → XP normal + XP ranked + coins
6. Si invalide → Erreur "Photo invalide"
```

---

### [2026-01-31] [0016] Système de Quêtes et Achievements

**Commit**: `7e73295` | **PR**: #14

**Actions**:
- Quêtes journalières générées automatiquement (3 par jour)
- Système d'achievements permanents (milestones)
- Progression automatique via hooks dans habitsStore
- Récompenses réclamables (XP + coins)
- Nouvel onglet Quêtes dans la tab bar

**Fichiers créés**:
- `supabase/migrations/007_quest_system.sql`
- `apps/mobile/src/constants/quests.ts` (templates de quêtes)
- `apps/mobile/src/services/quest.service.ts`
- `apps/mobile/src/stores/questStore.ts`
- `apps/mobile/src/components/QuestCard.tsx`
- `apps/mobile/src/components/QuestRewardModal.tsx`
- `apps/mobile/app/(tabs)/quests.tsx`

**Fichiers modifiés**:
- `apps/mobile/app/(tabs)/_layout.tsx` (ajout onglet Quêtes)
- `apps/mobile/src/stores/habitsStore.ts` (hooks quest progress)
- `apps/mobile/src/stores/authStore.ts` (clear quests on logout)
- `apps/mobile/src/types/index.ts` (DailyQuest, Achievement)

**Tables créées**:
```sql
-- daily_quests: quêtes journalières avec progression
CREATE TABLE daily_quests (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  quest_date DATE NOT NULL,
  template_id TEXT NOT NULL,
  params JSONB DEFAULT '{}',
  current_progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  reward_xp INTEGER NOT NULL,
  reward_coins INTEGER NOT NULL,
  is_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- achievements: milestones permanents
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  achievement_id TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  reward_xp INTEGER NOT NULL,
  reward_coins INTEGER NOT NULL,
  is_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);
```

**Logique**:
- `questStore.onHabitCompleted()` appelé après chaque complétion
- Met à jour la progression des quêtes journalières et achievements
- Templates de quêtes: "Complète N habitudes", "Complète une habitude du domaine X", etc.

---

### [2026-02-01] [0017] Notifications Push Locales

**Commit**: `33c2f77` | **PR**: #15

**Actions**:
- Notifications locales via `expo-notifications`
- Rappel quotidien à 20h00
- Alerte streak en danger à 21h00
- Félicitations milestone (immédiat)
- Toggle on/off global dans settings

**Fichiers créés**:
- `apps/mobile/src/services/notification.service.ts`

**Fichiers modifiés**:
- `apps/mobile/app.json` (plugin expo-notifications)
- `apps/mobile/src/stores/characterStore.ts` (notificationsEnabled state, toggle, load)
- `apps/mobile/src/stores/habitsStore.ts` (milestone + reschedule hooks)
- `apps/mobile/src/providers/AuthProvider.tsx` (init + AppState listener)
- `apps/mobile/app/(tabs)/home.tsx` (Switch toggle UI)

**Service Notification**:
```typescript
// notification.service.ts
- initializeNotifications(): permissions + handler config
- getNotificationsEnabled() / setNotificationsEnabled(): AsyncStorage
- rescheduleAllNotifications(data): cancelle + replanifie selon état
- scheduleDailyReminder(): DailyTriggerInput à 20h00
- scheduleStreakDangerAlert(streak): DailyTriggerInput à 21h00
- showMilestoneNotification(streak, coins): notification immédiate
- cancelAllNotifications()
```

**Stratégie de reschedule**:
- Reschedule à chaque retour au foreground (AppState listener)
- Reschedule après complétion d'habitude
- Pas de rappel si habitudes déjà complétées aujourd'hui

**Bug Fix**: `NotificationBehavior` type requiert `shouldShowBanner` et `shouldShowList` en plus de `shouldShowAlert`.

---

### [2026-02-01] [0018] Leaderboard (Classement Ranked)

**Commit**: `bc32922` | **PR**: #16

**Actions**:
- Classement global (all-time ranked XP) et hebdomadaire (reset lundi)
- Table `weekly_ranked_xp` pour tracking hebdo
- RPCs pour requêtes de classement
- Section leaderboard dans l'onglet Personnage avec segment control

**Fichiers créés**:
- `supabase/migrations/008_leaderboard.sql`
- `apps/mobile/src/services/leaderboard.service.ts`
- `apps/mobile/src/components/LeaderboardCard.tsx`

**Fichiers modifiés**:
- `apps/mobile/app/(tabs)/character.tsx` (section leaderboard)
- `apps/mobile/src/services/habitLogs.service.ts` (record weekly XP)
- `apps/mobile/src/types/index.ts` (LeaderboardEntry)

**Migration 008**:
```sql
-- Table weekly_ranked_xp
CREATE TABLE weekly_ranked_xp (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  week_start DATE NOT NULL,  -- date_trunc('week', CURRENT_DATE)
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(character_id, week_start)
);

-- RPC record_weekly_ranked_xp: upsert avec ON CONFLICT DO UPDATE
-- RPC get_leaderboard(type, limit): ROW_NUMBER() OVER ranking
-- RPC get_user_rank(character_id, type): position de l'utilisateur
```

**UI Leaderboard**:
- Segment control Global / Hebdomadaire
- Top 10 avec médailles (1er/2e/3e)
- Ligne surlignée pour l'utilisateur courant
- Position affichée si hors top 10

---

### [2026-02-01] [0019] Animations & Polish

**Commit**: `e18084b` | **PR**: #17

**Actions**:
- Barres de progression XP animées (react-native-reanimated `withTiming`)
- Animation spring sur checkbox/card de complétion d'habitude
- Entrée staggered des cartes leaderboard (fade + slide)
- Toast XP flottant après complétion d'habitude

**Fichiers créés**:
- `apps/mobile/src/components/XPToast.tsx`

**Fichiers modifiés**:
- `apps/mobile/src/components/XPProgressBar.tsx` (Animated.View + withTiming)
- `apps/mobile/src/components/LeaderboardCard.tsx` (staggered entrance)
- `apps/mobile/app/(tabs)/habits.tsx` (spring animations checkbox + card)
- `apps/mobile/app/(tabs)/_layout.tsx` (XPToast dans layout)
- `apps/mobile/src/stores/habitsStore.ts` (showXPToast calls)

**XPToast** (pattern event emitter):
```typescript
// Utilisable depuis n'importe quel store/service
import { showXPToast } from '../components/XPToast';
showXPToast(20);                    // "+20 XP gagné"
showXPToast(30, 'Ranked XP');       // "Ranked XP : +30 XP"

// File d'attente: les toasts s'enchaînent si multiples
// Animation: slide-down + scale spring + auto-dismiss 1.8s
```

**Animations implémentées**:
| Composant | Animation | Lib |
|-----------|-----------|-----|
| XPProgressBar | Fill width smooth 600ms | `withTiming` + `Easing.out` |
| HabitCompletionCard | Card scale 0.97 → 1 | `withSpring` + `withSequence` |
| Checkbox | Scale 1.3 → 1 bounce | `withSpring` |
| LeaderboardCard | Fade + translateY stagger 60ms | `withDelay` + `withTiming` |
| XPToast | Slide-down + scale + fade-out | `withTiming` + `Easing.back` |

---

### [2026-02-02] [0020] Historique & Statistiques

**Commit**: `a820915` | **PR**: #18

**Actions**:
- Nouvel onglet Stats (6e tab)
- Service de requêtes agrégées pour statistiques
- Heatmap d'activité 4 semaines (style GitHub)
- Répartition par domaine avec barres
- Historique récent des complétions

**Fichiers créés**:
- `apps/mobile/src/services/statistics.service.ts`
- `apps/mobile/app/(tabs)/stats.tsx`

**Fichiers modifiés**:
- `apps/mobile/app/(tabs)/_layout.tsx` (ajout onglet Stats)

**Service Statistics**:
```typescript
// statistics.service.ts
- getDailyCompletions(characterId, days): complétions/jour (heatmap)
- getDomainStats(characterId): répartition par domaine
- getStatsSummary(characterId): totaux agrégés
- getRecentCompletions(characterId, limit): historique récent

// Pas de table supplémentaire - agrégation depuis habit_logs
```

**Écran Stats**:
```
┌─────────────────────────────┐
│  [Complétions] [XP Total]   │  ← Summary cards (2x3 grid)
│  [Streak]     [Moy./jour]  │
│  [Best streak] [Ranked]     │
├─────────────────────────────┤
│  Activité (4 semaines)      │  ← Heatmap 7x4 grid
│  L M M J V S D              │     Intensité couleur par complétions
│  ■ ■ □ ■ ■ □ □             │
│  ■ ■ ■ ■ □ □ □             │
│  □ ■ ■ ■ ■ □ □             │
│  ■ ■ ■ □ □ □ □             │
│  Moins ■■■■ Plus            │     Légende
├─────────────────────────────┤
│  Répartition par domaine    │  ← Barres horizontales proportionnelles
│  📖 Études    ████████ 12  │     Triées par nombre de complétions
│  💪 Sport     ██████   8   │
│  🧘 Méditation ████    5   │
├─────────────────────────────┤
│  Historique récent          │  ← 15 dernières complétions
│  📖 Révisions  +20 XP      │     Date, heure, domaine, XP
│  💪 Course     +30 XP 🏆   │     Badge ranked si applicable
│  ...                        │
└─────────────────────────────┘
```

**Pull-to-refresh** disponible pour actualiser les données.

---

## Prochaines Étapes

### [0021+] À venir
- Design System / Thème cohérent
- Vue historique du journal
- Profil utilisateur éditable
- Système de niveaux pour achievements
- Animations de level-up
- Mode sombre

---

**Fin du TRACE - Dernière mise à jour: 2026-02-02**
