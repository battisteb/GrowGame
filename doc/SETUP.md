# Guide d'Installation - GrowGame

> Ce guide permet à n'importe quel membre de l'équipe de configurer son environnement de développement.

**Status**: ✅ À jour (dernière vérification: 2026-02-02)

---

## Prérequis

### Node.js (v18+, v22 LTS recommandé)

**Windows :**

```bash
# Option 1 : Téléchargement direct
# https://nodejs.org/en/download/ (choisir LTS)

# Option 2 : Via winget
winget install OpenJS.NodeJS.LTS

# Option 3 : Via Chocolatey
choco install nodejs-lts
```

**macOS :**

```bash
# Option 1 : Via Homebrew (recommandé)
brew install node

# Option 2 : Via nvm (gestion de versions)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22
```

**Vérification :**

```bash
node --version  # Doit afficher v18+
npm --version   # Doit afficher 9+
```

---

### Git

**Windows :**

```bash
winget install Git.Git
# ou télécharger depuis https://git-scm.com/download/win
```

**macOS :**

```bash
# Git est souvent préinstallé, sinon :
brew install git
```

---

### Expo Go (Application mobile pour tester)

- **iOS** : [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- **Android** : [Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

**Note**: Depuis 2026-02-02, l'app fonctionne directement sur Expo Go (pas de development build requis).

---

## Installation du Projet

### 1. Cloner le repository

```bash
git clone <URL_DU_REPO>
cd GrowGame
```

### 2. Installer les dépendances

```bash
cd apps/mobile
npm install
```

### 3. Lancer l'application

```bash
# Démarrer le serveur de développement
npm start
# ou
npx expo start

# Scanner le QR code avec Expo Go (Android)
# ou appuyer sur 'i' pour iOS Simulator / 'a' pour Android Emulator
```

---

## Dépendances du Projet

### Core (installées automatiquement avec create-expo-app)

| Package        | Version | Description    |
| -------------- | ------- | -------------- |
| `expo`         | ~52.x   | Framework Expo |
| `react`        | 18.x    | React          |
| `react-native` | 0.76.x  | React Native   |
| `typescript`   | ~5.x    | TypeScript     |

### Navigation (à installer)

```bash
npm install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens
```

| Package                          | Description        |
| -------------------------------- | ------------------ |
| `expo-router`                    | File-based routing |
| `expo-linking`                   | Deep linking       |
| `expo-constants`                 | Constantes Expo    |
| `expo-status-bar`                | Barre de status    |
| `react-native-safe-area-context` | Gestion safe area  |
| `react-native-screens`           | Navigation native  |

### État & Data (à installer)

```bash
npm install zustand @supabase/supabase-js
```

| Package                 | Description            |
| ----------------------- | ---------------------- |
| `zustand`               | State management léger |
| `@supabase/supabase-js` | Client Supabase        |

### UI & Styling (à installer)

```bash
npm install react-native-reanimated react-native-gesture-handler
```

| Package                        | Description             |
| ------------------------------ | ----------------------- |
| `react-native-reanimated`      | Animations performantes |
| `react-native-gesture-handler` | Gestion des gestes      |

### Utilitaires (à installer)

```bash
npm install date-fns
```

| Package    | Description           |
| ---------- | --------------------- |
| `date-fns` | Manipulation de dates |

### Dev Dependencies (à installer)

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier eslint-plugin-prettier
```

| Package                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| `eslint`                 | Linter JavaScript/TypeScript                              |
| `@typescript-eslint/*`   | Support TypeScript pour ESLint                            |
| `prettier`               | Formateur de code                                         |
| `eslint-config-prettier` | Désactive les règles ESLint qui conflictent avec Prettier |

---

## Installation Complète (One-liner)

### Après avoir cloné le repo :

```bash
cd apps/mobile && npm install && npm install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens zustand @supabase/supabase-js react-native-reanimated react-native-gesture-handler date-fns && npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier eslint-plugin-prettier
```

---

## Configuration de l'Éditeur (VS Code)

### Extensions recommandées

1. **ESLint** - dbaeumer.vscode-eslint
2. **Prettier** - esbenp.prettier-vscode
3. **React Native Tools** - msjsdiag.vscode-react-native
4. **TypeScript Importer** - pmneo.tsimporter

### Settings recommandés (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Simulateurs/Émulateurs (Optionnel)

### Android Emulator (Windows/Mac)

1. Installer [Android Studio](https://developer.android.com/studio)
2. Ouvrir Android Studio > More Actions > Virtual Device Manager
3. Créer un device (Pixel 6 recommandé)
4. Lancer l'émulateur

### iOS Simulator (Mac uniquement)

1. Installer Xcode depuis l'App Store
2. Ouvrir Xcode > Preferences > Components > Installer un simulateur
3. Ou directement : `open -a Simulator`

---

## Variables d'Environnement

Créer un fichier `.env` à la racine de `apps/mobile/` :

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon

# Google Cloud Vision (pour la vérification photo)
# EXPO_PUBLIC_GOOGLE_VISION_API_KEY=votre-clé
```

> **Note** : Ne jamais commiter le fichier `.env` ! Il est dans `.gitignore`.

---

## Commandes Utiles

```bash
# Démarrer le dev server
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS (Mac uniquement)
npm run ios

# Lancer en mode web
npm run web

# Linter
npm run lint

# Formatter
npm run format

# Build de production
npx expo build:android
npx expo build:ios
```

---

## Troubleshooting

### "Command not found: expo"

```bash
npm install -g expo-cli
```

### "Unable to resolve module"

```bash
npm install
npx expo start --clear
```

### Cache issues

```bash
npx expo start --clear
# ou
rm -rf node_modules && npm install
```

### Metro bundler crash

```bash
npx expo start --reset-cache
```

---

## Checklist Premier Lancement

- [ ] Node.js installé (v18+)
- [ ] Git installé
- [ ] Repo cloné
- [ ] `npm install` exécuté dans `apps/mobile`
- [ ] Expo Go installé sur le téléphone
- [ ] `npm start` fonctionne
- [ ] QR code scanné, app visible sur le téléphone
