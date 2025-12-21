# Guide de Contribution - GrowGame

> Ce guide explique comment collaborer efficacement sur le projet.

---

## Table des Matières

1. [Configuration initiale](#configuration-initiale)
2. [Workflow Git](#workflow-git)
3. [Conventions de commits](#conventions-de-commits)
4. [Branches](#branches)
5. [Pull Requests](#pull-requests)
6. [Environnements](#environnements)
7. [Avant de pusher](#avant-de-pusher)

---

## Configuration Initiale

### 1. Cloner le repository

```bash
git clone https://github.com/VOTRE_ORG/GrowGame.git
cd GrowGame
```

### 2. Installer les dépendances

```bash
cd apps/mobile
npm install
```

### 3. Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos clés (demander à l'équipe si besoin)
code .env
```

### 4. Vérifier que tout fonctionne

```bash
npm start
```

---

## Workflow Git

### Workflow recommandé : GitHub Flow (simplifié)

```
main (production-ready)
  │
  ├── feature/nom-de-la-feature
  │     └── Développement de nouvelles fonctionnalités
  │
  ├── fix/description-du-bug
  │     └── Corrections de bugs
  │
  └── chore/description
        └── Maintenance, refactoring, docs
```

### Étapes pour une nouvelle feature

```bash
# 1. Se mettre à jour sur main
git checkout main
git pull origin main

# 2. Créer une nouvelle branche ([XXXX] étant le numéro de la feature)
git checkout -b feature/[XXXX]nom-de-la-feature
#Ou alors (en fonction de la modification)
# git checkout -b fix/[XXXX]nom-de-la-feature


# 3. Développer (commits réguliers)
git add .
git commit -m "feat[XXXX]: description du changement"

# 4. Pusher la branche
git push -u origin feature/[XXXX]nom-de-la-feature

# 5. Créer une Pull Request sur GitHub

# 6. Après merge, supprimer la branche locale
git checkout main
git pull origin main
git branch -d feature/nom-de-la-feature
```

---

## Conventions de Commits

Nous utilisons les [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

### Types de commits

| Type       | Description                           | Exemple                                        |
| ---------- | ------------------------------------- | ---------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité               | `feat(habits): add photo verification`         |
| `fix`      | Correction de bug                     | `fix(auth): resolve login crash on iOS`        |
| `docs`     | Documentation                         | `docs: update SETUP.md`                        |
| `style`    | Formatage (pas de changement de code) | `style: fix indentation`                       |
| `refactor` | Refactoring                           | `refactor(character): simplify XP calculation` |
| `test`     | Ajout/modification de tests           | `test(habits): add unit tests for streak`      |
| `chore`    | Maintenance                           | `chore: update dependencies`                   |

### Scopes suggérés

- `auth` - Authentification
- `character` - Personnage et progression
- `habits` - Habitudes quotidiennes
- `quests` - Quêtes et objectifs
- `shop` - Boutique
- `ui` - Composants UI
- `db` - Base de données
- `config` - Configuration

### Exemples

```bash
# Feature
git commit -m "feat(habits): add daily habit completion flow"

# Bug fix
git commit -m "fix(character): correct XP calculation for level 10+"

# Documentation
git commit -m "docs: add API documentation for habits service"

# Refactoring
git commit -m "refactor(shop): extract item card component"
```

---

## Branches

### Branches protégées

| Branche | Description                       | Qui peut merger   |
| ------- | --------------------------------- | ----------------- |
| `main`  | Code stable, prêt pour production | Via PR uniquement |

### Conventions de nommage

```
feature/description-courte    # Nouvelles fonctionnalités
fix/description-du-bug        # Corrections de bugs
chore/description             # Maintenance
docs/description              # Documentation
refactor/description          # Refactoring
```

### Exemples

```
feature/photo-verification
feature/streak-rewards
fix/login-crash-ios
fix/xp-calculation
chore/update-expo-sdk
docs/api-documentation
refactor/habits-store
```

---

## Pull Requests

### Checklist avant de créer une PR

- [ ] Le code compile sans erreurs (`npm run typecheck`)
- [ ] Le linter passe (`npm run lint`)
- [ ] J'ai testé sur mon appareil/simulateur
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Les commits suivent les conventions

### Template de PR

```markdown
## Description

[Décrivez brièvement ce que fait cette PR]

## Type de changement

- [ ] Nouvelle feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation
- [ ] Autre: \_\_\_

## Comment tester

1. [Étape 1]
2. [Étape 2]
3. [Résultat attendu]

## Screenshots (si applicable)

[Ajouter des captures d'écran]

## Checklist

- [ ] Mon code compile sans erreurs
- [ ] J'ai testé les changements
- [ ] J'ai mis à jour la doc si nécessaire
```

### Review process

1. **Créer la PR** avec une description claire
2. **Assigner un reviewer** (l'autre dev)
3. **Répondre aux commentaires** et faire les modifications
4. **Merger** une fois approuvé
5. **Supprimer la branche** après merge

---

## Environnements

### Variables d'environnement

| Fichier        | Usage                     | Commité ? |
| -------------- | ------------------------- | --------- |
| `.env.example` | Template de référence     | ✅ Oui    |
| `.env`         | Config locale personnelle | ❌ Non    |

### Valeurs par environnement

```bash
# Développement (local)
EXPO_PUBLIC_APP_ENV=development

# Staging (tests)
EXPO_PUBLIC_APP_ENV=staging

# Production
EXPO_PUBLIC_APP_ENV=production
```

### Ajouter une nouvelle variable

1. Ajouter dans `.env.example` avec une valeur placeholder
2. Ajouter dans `src/config/env.ts`
3. Documenter dans le README si nécessaire
4. Prévenir l'équipe de mettre à jour leur `.env`

---

## Avant de Pusher

### Checklist rapide

```bash
# 1. Vérifier le typage TypeScript
npm run typecheck

# 2. Vérifier le linting
npm run lint

# 3. Formater le code
npm run format

# 4. Tester l'app
npm start
```

### Script pratique (à ajouter dans package.json)

```json
{
  "scripts": {
    "check": "npm run typecheck && npm run lint"
  }
}
```

---

## Communication

### Mettre à jour TRACE.md

Après chaque travail significatif :

1. Ouvrir `doc/TRACE.md`
2. Ajouter une entrée dans la section appropriée
3. Inclure : date, ce qui a été fait, fichiers clés

### Prévenir l'équipe

Pour les changements importants :

- Nouvelles dépendances → Message à l'équipe
- Changements de structure → Mettre à jour ARCHITECTURE.md
- Nouvelles variables d'env → Prévenir pour màj du .env

---

## Résolution de Conflits

### Workflow en cas de conflit

```bash
# 1. Mettre à jour main
git checkout main
git pull origin main

# 2. Revenir sur ta branche
git checkout ma-branche

# 3. Rebase sur main
git rebase main

# 4. Résoudre les conflits fichier par fichier
# Éditer les fichiers marqués
git add <fichier-résolu>
git rebase --continue

# 5. Force push (attention: seulement sur ta branche!)
git push --force-with-lease
```

### En cas de doute

- **Ne pas forcer** sur `main`
- **Demander de l'aide** à l'autre dev
- **Communiquer** avant de résoudre des conflits complexes

---

## Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
