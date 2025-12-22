# Architecture Technique - GrowGame

> Document vivant - Mis à jour au fil des décisions techniques

## Stack Technologique

| Composant            | Technologie             | Version | Justification                                      |
| -------------------- | ----------------------- | ------- | -------------------------------------------------- |
| **Framework Mobile** | React Native + Expo     | SDK 52+ | Cross-platform, écosystème React connu de l'équipe |
| **Langage**          | TypeScript              | 5.x     | Typage statique, meilleure maintenabilité          |
| **Navigation**       | Expo Router             | 4.x     | File-based routing, conventions claires            |
| **État global**      | Zustand                 | 5.x     | Léger, simple, pas de boilerplate                  |
| **Backend**          | Supabase                | -       | Auth + DB + Storage + Realtime intégrés            |
| **Base de données**  | PostgreSQL (Supabase)   | -       | Requêtes complexes, relations, RLS                 |
| **DB locale**        | WatermelonDB            | -       | Offline-first, sync automatique                    |
| **Notifications**    | Expo Notifications      | -       | Intégré à Expo                                     |
| **Vérification IA**  | Google Cloud Vision API | -       | MVP, migration modèle embarqué possible            |

---

## Structure du Projet

```
GrowGame/
├── doc/                          # Documentation Obsidian
│   ├── ARCHITECTURE.md           # Ce fichier
│   ├── TRACE.md                  # Journal des décisions/actions
│   ├── Personnage/
│   ├── Objectifs/
│   ├── Notifications/
│   ├── DA/
│   └── ...
│
├── apps/
│   └── mobile/                   # Application React Native/Expo
│       ├── app/                  # Routes (Expo Router)
│       │   ├── (auth)/           # Routes non authentifiées
│       │   ├── (tabs)/           # Navigation principale
│       │   └── _layout.tsx       # Layout racine
│       │
│       ├── src/
│       │   ├── components/       # Composants React
│       │   │   ├── ui/           # Design system (Button, Input, Card...)
│       │   │   └── domain/       # Composants métier (CharacterAvatar...)
│       │   │
│       │   ├── features/         # Modules fonctionnels
│       │   │   ├── auth/         # Authentification
│       │   │   ├── character/    # Personnage et progression
│       │   │   ├── habits/       # Habitudes quotidiennes
│       │   │   ├── quests/       # Quêtes et objectifs
│       │   │   ├── shop/         # Boutique
│       │   │   └── journal/      # Journal quotidien
│       │   │
│       │   ├── stores/           # Stores Zustand globaux
│       │   ├── services/         # API, Supabase, IA
│       │   ├── hooks/            # Custom hooks partagés
│       │   ├── utils/            # Helpers, formatters
│       │   ├── constants/        # Constantes (XP, game rules)
│       │   └── types/            # Types TypeScript globaux
│       │
│       ├── assets/               # Images, fonts, sons
│       ├── app.json              # Config Expo
│       ├── tsconfig.json
│       ├── .eslintrc.js
│       └── .prettierrc
│
├── packages/                     # Code partagé (futur web)
│   └── shared/
│       ├── constants/            # Formules XP, règles du jeu
│       └── types/                # Types partagés mobile/web
│
└── supabase/                     # Configuration Supabase
    ├── migrations/               # Schéma de base de données
    ├── seed.sql                  # Données initiales
    └── functions/                # Edge functions (decay, etc.)
```

---

## Conventions de Code

### Nommage

| Type                 | Convention             | Exemple                        |
| -------------------- | ---------------------- | ------------------------------ |
| Variables, fonctions | `camelCase`            | `getUserXp()`, `currentStreak` |
| Composants React     | `PascalCase`           | `CharacterAvatar`, `QuestCard` |
| Fichiers composants  | `PascalCase.tsx`       | `HabitList.tsx`                |
| Fichiers utilitaires | `camelCase.ts`         | `xpCalculator.ts`              |
| Constantes           | `SCREAMING_SNAKE_CASE` | `MAX_STREAK_BONUS`             |
| Types/Interfaces     | `PascalCase`           | `type Character = {...}`       |
| Dossiers             | `camelCase`            | `features/habits/`             |
| Tables DB            | `snake_case`           | `habit_logs`, `domain_skills`  |

### Structure d'une Feature

Chaque feature suit cette structure :

```
features/habits/
├── components/           # Composants spécifiques
│   ├── HabitCard.tsx
│   └── HabitForm.tsx
├── hooks/               # Hooks spécifiques
│   └── useHabits.ts
├── stores/              # Store Zustand
│   └── habitsStore.ts
├── services/            # Appels Supabase
│   └── habitsService.ts
├── types.ts             # Types locaux
└── index.ts             # Exports publics
```

### Règles de Code

1. **Un composant = un fichier** (sauf petits sous-composants)
2. **Pas de `any`** - utiliser `unknown` si vraiment nécessaire
3. **Logique métier dans hooks/stores**, pas dans les composants
4. **Noms explicites** - `handleSubmitHabit` plutôt que `handleClick`
5. **Commentaires minimaux** - le code doit être auto-explicatif
6. **Tests pour la logique critique** - formules XP, streak, decay

---

## Schéma de Base de Données

### Tables Principales

```sql
-- Utilisateurs (géré par Supabase Auth)
-- Accès via auth.users()

-- Personnage
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  global_level INTEGER DEFAULT 1,
  global_xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  mood TEXT DEFAULT 'neutral',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compétences par domaine
CREATE TABLE domain_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, -- etudes, sport, meditation, lecture, etirements
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  UNIQUE(character_id, domain)
);

-- Habitudes configurées
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1, -- 1-3
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Logs de complétion
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  photo_url TEXT,
  verified BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0
);

-- Items de la boutique
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- cosmetic, decoration, joker
  slot TEXT, -- couvre_chef, haut, bas, chaussures, accessoire
  price_coins INTEGER DEFAULT 0,
  price_gems INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  image_url TEXT,
  unlock_condition JSONB -- niveau requis, etc.
);

-- Items possédés par l'utilisateur
CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items(id),
  acquired_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Équipement actuel
CREATE TABLE equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  slot TEXT NOT NULL,
  item_id UUID REFERENCES shop_items(id),
  UNIQUE(character_id, slot)
);
```

### Enums/Valeurs

- **domain**: `etudes`, `sport`, `meditation`, `lecture`, `etirements`
- **slot**: `couvre_chef`, `haut`, `bas`, `chaussures`, `accessoire`
- **item_type**: `cosmetic`, `decoration`, `joker`
- **rarity**: `common`, `rare`, `epic`, `legendary`
- **mood**: `happy`, `neutral`, `tired`

---

## Formules de Jeu

### Calcul XP par niveau

```typescript
// XP requis pour atteindre un niveau
const xpForLevel = (level: number): number => {
  return Math.floor((100 * level ** 2) / 2);
};

// Niveau 1 → 50 XP
// Niveau 2 → 200 XP
// Niveau 3 → 450 XP
// Niveau 10 → 5000 XP
```

### Récompenses par action

| Action                          | XP  | Coins       |
| ------------------------------- | --- | ----------- |
| Habitude validée (difficulté 1) | +10 | +1          |
| Habitude validée (difficulté 2) | +20 | +2          |
| Habitude validée (difficulté 3) | +30 | +3          |
| Journal quotidien               | +5  | +0          |
| Streak 7 jours                  | +0  | +10 (bonus) |

### Decay des compétences

```typescript
// Après 7 jours d'inactivité dans un domaine
const decayLevel = (currentLevel: number): number => {
  const minLevel = Math.ceil(currentLevel / 2);
  return Math.max(1, minLevel);
};
```

---

## Répartition du Travail

| Développeur | Features principales                          |
| ----------- | --------------------------------------------- |
| Dev A       | Auth, Character, Progression (XP, niveaux)    |
| Dev B       | Habits, Quests, Photo verification            |
| Ensemble    | Setup initial, Architecture DB, Design system |

---

## Décisions Techniques Clés

| Date       | Décision             | Raison                                           |
| ---------- | -------------------- | ------------------------------------------------ |
| 2025-12-21 | React Native + Expo  | Équipe connaît React, Expo simplifie le dev      |
| 2025-12-21 | Supabase vs Firebase | Open-source, PostgreSQL, moins de vendor lock-in |
| 2025-12-21 | Zustand vs Redux     | Simplicité, 2 devs, pas besoin de complexité     |
| 2025-12-21 | Offline-first        | App d'habitudes doit marcher sans connexion      |

---

## TODO Techniques

- [ ] Setup projet Expo
- [ ] Configuration Supabase
- [ ] Schéma DB complet
- [ ] Auth flow
- [ ] Design system de base
- [ ] Feature: Character
- [ ] Feature: Habits
- [ ] Feature: Photo verification
