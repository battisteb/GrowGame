# TRACE - GrowGame

> Historique des décisions techniques et modifications importantes

**Dernière mise à jour** : 2025-12-30

---

## Table des Matières

- [Phase 0 - Setup](#phase-0---setup)
- [Phase 1 - Backend & Auth](#phase-1---backend--auth)
- [Phase 2 - Core Loop MVP](#phase-2---core-loop-mvp)
- [Phase 3 - Gamification](#phase-3---gamification)
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

### Stores (Zustand)
Un store par domaine d'état:
- `authStore.ts` - User, session
- `characterStore.ts` - Character, domain_skills
- `habitsStore.ts` - Habits, today's logs

### Utils
Logique métier pure (sans dépendances):
- `xpCalculator.ts` - Formules XP → Level
- `streakCalculator.ts` - Logique de streak
- `decayCalculator.ts` - Logique de decay
- `moodCalculator.ts` - Calcul de l'humeur

---

## Prochaines Étapes

### [0014] Équipement du Personnage
- Service equipment.service.ts
- Interface d'équipement dans character screen
- Affichage visuel des items équipés

### [0015+] À venir
- Système de quêtes
- Écran character avec équipements
- Historique du journal dans character screen
- Photos pour validation d'habitudes

---

**Fin du TRACE - Dernière mise à jour: 2025-12-30**
