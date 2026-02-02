# GrowGame

> Application mobile de gamification de la discipline personnelle.

**Status**: 🟢 **Compilable** (Dernière mise à jour: 2026-02-02)

---

## Concept

GrowGame transforme vos habitudes quotidiennes en aventure. Votre personnage évolue au fur et à mesure que vous progressez dans la vie réelle.

**5 Domaines de progression :**

- 📚 Études
- 🏋️ Sport
- 🧘 Méditation
- 📖 Lecture
- 🧘‍♀️ Étirements

---

## Statut du Projet

### Phase actuelle: 3️⃣ Gamification (EN COURS)

| Phase       | Status      | Détails                                             |
| ----------- | ----------- | --------------------------------------------------- |
| **Phase 0** | ✅ Fait     | Setup & Infrastructure                              |
| **Phase 1** | ✅ Fait     | Backend & Auth (Supabase)                           |
| **Phase 2** | ✅ Fait     | Core Loop MVP (habitudes, dashboard)                |
| **Phase 3** | 🔄 En cours | Gamification (leaderboards, streaks, quêtes, decay) |
| **Phase 4** | ⏳ À venir  | Shop & Cosmétiques                                  |
| **Phase 5** | ⏳ À venir  | Polish & Amélioration                               |

### Derniers correctifs (2026-02-02)

✅ **Résolu**: Erreur Worklets mismatch (React.Animated remplace react-native-reanimated)
✅ **Amélioré**: Dépendances expo mises à jour (54.0.33, router 6.0.23)
✅ **Nettoyé**: Configuration watchman pour stabilité du bundler

---

## Quick Start

### Prérequis

- Node.js 18+
- npm 9+
- Expo Go sur votre téléphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# Cloner le repo (token SSH)
git clone git@github.com:battisteb/GrowGame.git
cd GrowGame

# Installer les dépendances
cd apps/mobile
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer l'app
npm start
```

Scannez le QR code avec Expo Go.

**Note**: L'app compile maintenant sans erreurs et fonctionne sur Expo Go.

---

## Structure du Projet

```
GrowGame/
├── apps/
│   └── mobile/              # Application React Native (Expo)
│       ├── app/             # Routes (Expo Router)
│       ├── src/
│       │   ├── components/  # Composants réutilisables
│       │   ├── services/    # Logique métier (auth, character, habits, etc.)
│       │   ├── stores/      # État global (Zustand)
│       │   ├── utils/       # Utilitaires (calculateurs, helpers)
│       │   ├── constants/   # Constantes du jeu
│       │   └── types/       # Types TypeScript
│       ├── package.json
│       └── tsconfig.json
├── supabase/
│   └── migrations/          # Schéma DB (SQL)
├── doc/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── TRACE.md
│   └── (décisions & designs)
├── TODO.md                  # Roadmap détaillée
├── TRACE.md                 # Journal des décisions techniques
├── CHANGELOG.md             # Historique des changements
└── README.md                # Ce fichier
```

---

## Documentation

| Document                                   | Description                                             |
| ------------------------------------------ | ------------------------------------------------------- |
| [TODO.md](TODO.md)                         | Roadmap complète avec phases et tâches                  |
| [TRACE.md](TRACE.md)                       | Journal technique détaillé (décisions, bugs, solutions) |
| [CHANGELOG.md](CHANGELOG.md)               | Historique des changements par version                  |
| [doc/SETUP.md](doc/SETUP.md)               | Guide d'installation et configuration                   |
| [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md) | Décisions architecturales                               |
| [CONTRIBUTING.md](CONTRIBUTING.md)         | Guide de contribution                                   |

---

## Stack Technique

| Technologie    | Version  | Usage                                         |
| -------------- | -------- | --------------------------------------------- |
| React Native   | 0.81.5   | Framework mobile                              |
| Expo           | ~54.0.33 | Build & deploy                                |
| TypeScript     | ~5.9     | Langage fortement typé                        |
| Expo Router    | ~6.0.23  | Navigation file-based                         |
| Zustand        | ^5.0     | State management                              |
| React.Animated | natif    | Animations (remplace react-native-reanimated) |
| Supabase       | ^2.89.0  | Backend (Auth, PostgreSQL, RLS)               |

---

## Scripts

```bash
npm start              # Démarrer le serveur de dev (Expo)
npm run android       # Ouvrir sur émulateur Android
npm run ios          # Ouvrir sur émulateur iOS
npm run web          # Ouvrir version web (Expo)
npm run lint         # Vérifier le code (ESLint)
npm run lint:fix     # Corriger les issues ESLint
npm run format       # Formater le code (Prettier)
npm run typecheck    # Vérifier les types TypeScript
npm run check        # Lint + typecheck
```

---

## Principes de Développement

- **Pragmatisme**: Features simples d'abord, complexité ensuite
- **Maintenabilité**: Code clair > code parfait
- **Testabilité**: Validé manuellement sur mobile avant merge
- **Portabilité**: Préférer API React Native standard (moins de natives)

---

## Équipe

Projet développé par deux développeurs passionnés avec l'objectif de créer une app gamifiée motivante.

---

## Licence

Privé - Tous droits réservés.
