# GrowGame

> Application mobile de gamification de la discipline personnelle.

---

## Concept

GrowGame transforme vos habitudes quotidiennes en aventure. Votre personnage évolue au fur et à mesure que vous progressez dans la vie réelle.

**5 Domaines de progression :**
- Études
- Sport
- Méditation
- Lecture
- Étirements

---

## Quick Start

### Prérequis

- Node.js 18+
- npm 9+
- Expo Go sur votre téléphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# Cloner le repo
git clone https://github.com/VOTRE_ORG/GrowGame.git
cd GrowGame

# Installer les dépendances
cd apps/mobile
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés

# Lancer l'app
npm start
```

Scannez le QR code avec Expo Go.

---

## Structure du Projet

```
GrowGame/
├── apps/
│   └── mobile/          # Application React Native (Expo)
├── packages/
│   └── shared/          # Code partagé (futur)
├── supabase/            # Configuration backend
└── doc/                 # Documentation (Obsidian)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](doc/SETUP.md) | Guide d'installation détaillé |
| [ARCHITECTURE.md](doc/ARCHITECTURE.md) | Décisions techniques et architecture |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guide de contribution |
| [TRACE.md](doc/TRACE.md) | Journal des décisions |

---

## Stack Technique

| Technologie | Usage |
|-------------|-------|
| React Native + Expo | Application mobile |
| TypeScript | Langage |
| Expo Router | Navigation |
| Zustand | State management |
| Supabase | Backend (Auth, DB, Storage) |

---

## Scripts

```bash
npm start          # Démarrer le serveur de dev
npm run lint       # Vérifier le code
npm run format     # Formater le code
npm run typecheck  # Vérifier les types TypeScript
```

---

## Équipe

Projet développé par deux développeurs passionnés.

---

## Licence

Privé - Tous droits réservés.
