# 📖 Guide de la Documentation - GrowGame

> Tous les fichiers markdown du projet et comment les utiliser

---

## 📍 Fichiers Principaux (Racine)

### `README.md`

**Description**: Point d'entrée du projet  
**Contient**: Concept, status, quick start, structure, stack  
**Pour qui**: Tout nouveau venant, contributeur, stakeholder  
**À lire en premier**: ✅ OUI

### `TODO.md`

**Description**: Roadmap complète et détaillée  
**Contient**: Vision, phases, tâches avec status, critères d'acceptation  
**Pour qui**: Product owners, développeurs pour planning  
**Détail**: Phase par phase, tâche par tâche

### `TRACE.md`

**Description**: Journal technique des décisions et bugs  
**Contient**: Historique phase par phase, problèmes rencontrés, solutions appliquées  
**Pour qui**: Développeurs, future maintenance, apprentissage  
**Utilité**: Comprendre le **pourquoi** derrière les choix

### `CHANGELOG.md`

**Description**: Historique des versions et changements  
**Contient**: Changements par version, format "Keep a Changelog"  
**Pour qui**: Stakeholders, release notes  
**Mises à jour**: À chaque version majeure

### `CONTRIBUTING.md`

**Description**: Comment contribuer au projet  
**Contient**: Git workflow, conventions de code, PR process  
**Pour qui**: Tout contributeur nouveau  
**À lire**: Avant le premier commit

### `QUICK-STATUS.md` ⭐ NEW

**Description**: Status rapide du projet (1 page)  
**Contient**: Status compilable, fichiers changés, phase actuelle  
**Pour qui**: Quick check du projet  
**Utilité**: Comprendre l'état actuel sans lire tous les docs

### `MODIFICATIONS-2026-02-02.md` ⭐ NEW

**Description**: Résumé des modifications récentes  
**Contient**: Objectif, résultat, changements techniques, documentation  
**Pour qui**: Comprendre les changements de 02/02/26  
**Utilité**: Context rapide pour les autres développeurs

---

## 📂 Fichiers dans `doc/`

### `ARCHITECTURE.md`

**Description**: Décisions architecturales du projet  
**Contient**: Structure dossiers, patterns, conventions  
**Pour qui**: Développeurs, pour cohérence  
**Consulter**: Quand ajouter un nouveau composant/service

### `SETUP.md`

**Description**: Guide d'installation détaillé  
**Contient**: Prérequis, installation, configuration, troubleshooting  
**Pour qui**: Développeurs locaux  
**À lire**: Première fois qu'on setup le projet

### `GUIDE-ANIMATIONS.md` ⭐ NEW

**Description**: Comment les animations fonctionnent  
**Contient**: API utilisée, composants animés, exemples, améliorations  
**Pour qui**: Développeurs travaillant sur UI/animations  
**Utilité**: Référence pour ajouter/modifier animations

### `MAINTENANCE-2026-02-02.md` ⭐ NEW

**Description**: Détails complets des corrections apportées  
**Contient**: Problème, solutions, fichiers modifiés, recommandations  
**Pour qui**: Développeurs curieux, future maintenance  
**Utilité**: Comprendre comment le bug a été corrigé

### `Notifications/`, `Objectifs/`, `Personnage/`, `DA/`, etc.

**Description**: Documentation métier et design  
**Contient**: Spécifications produit, designs, concepts  
**Pour qui**: Product owners, designers, développeurs features  
**Organiser**: Par domaine métier

---

## 🗂️ Tableau Récapitulatif

| Fichier             | Type       | Priorité   | Fréquence MàJ           |
| ------------------- | ---------- | ---------- | ----------------------- |
| README.md           | Guide      | 🔴 Haute   | Régulière               |
| TODO.md             | Roadmap    | 🔴 Haute   | Avec chaque sprint      |
| TRACE.md            | Technique  | 🟡 Moyenne | Avec chaque décision    |
| CHANGELOG.md        | Historique | 🟢 Basse   | À chaque version        |
| CONTRIBUTING.md     | Règles     | 🔴 Haute   | Si changements workflow |
| QUICK-STATUS.md     | Status     | 🟡 Moyenne | Hebdo                   |
| MODIFICATIONS-\*.md | Spécial    | 🟢 Basse   | Pour gros changements   |
| SETUP.md            | Guide      | 🔴 Haute   | Si env change           |
| ARCHITECTURE.md     | Technique  | 🟡 Moyenne | Si arch change          |
| GUIDE-ANIMATIONS.md | Technique  | 🟢 Basse   | Si animations changent  |
| MAINTENANCE-\*.md   | Spécial    | 🟢 Basse   | Pour maintenance        |

---

## 🎯 Workflows - Quel Doc Consulter?

### 👤 Je suis nouveau contributeur

1. Lire [README.md](README.md) (overview)
2. Lire [CONTRIBUTING.md](CONTRIBUTING.md) (règles)
3. Lire [doc/SETUP.md](doc/SETUP.md) (installation)
4. Cloner et setup le projet
5. Commencer par une issue simple

### 🔧 Je dois fix un bug

1. Lire [TRACE.md](TRACE.md) (problèmes passés)
2. Lire [doc/MAINTENANCE-\*](doc/) (fixes récents)
3. Chercher code problématique
4. Fix et documenter dans TRACE.md

### 🎨 Je dois ajouter une feature

1. Lire [TODO.md](TODO.md) (quelle phase?)
2. Lire [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md) (structure)
3. Trouver composant similaire
4. Implémenter et commit
5. Mettre à jour TODO.md

### 📱 Je dois modifier une animation

1. Lire [doc/GUIDE-ANIMATIONS.md](doc/GUIDE-ANIMATIONS.md) (comment ça marche)
2. Trouver le composant dans `src/components/`
3. Modifier les valeurs `Animated.Value`
4. Tester sur mobile vrai

### 📊 Je dois mettre à jour les docs

1. Déterminer le type de doc (guide? historique? roadmap?)
2. Trouver le fichier approprié
3. Mettre à jour
4. Commit avec message `docs: ...`

### 🏗️ Je dois revoir l'architecture

1. Lire [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md) (état actuel)
2. Lire [TRACE.md](TRACE.md) (décisions passées)
3. Proposer changement
4. Documenter nouveau pattern

---

## 📝 Conventions de Documentation

### Headings

```markdown
# Main Title (H1) # Seulement 1 par fichier

## Sections (H2) # Major sections

### Subsections (H3) # Details

#### Sub-subsections (H4) # Pas trop profond
```

### Code Blocks

````markdown
```typescript
// TypeScript code
```
````

```bash
# Shell commands
```

````

### Listes
```markdown
- ✅ Fait
- 🔄 En cours
- ⏳ À faire
- 🐛 Bug
- ⚠️ Attention
````

### Emphasis

```markdown
**bold** - Important
_italic_ - Nuance
`code` - Technique
```

### Liens

```markdown
[Texte visible](chemin-du-fichier)
[Lien externe](https://example.com)
```

---

## 🔄 Cycle de Vie des Docs

### Création d'une Feature

1. Ajouter dans [TODO.md](TODO.md) avec status "À faire"
2. Mettre en cours
3. Implémenter
4. Ajouter notes dans [TRACE.md](TRACE.md)
5. Marquer comme "Fait" dans [TODO.md](TODO.md)
6. Ajouter dans [CHANGELOG.md](CHANGELOG.md) à la prochaine version

### Documentation Technique

1. Créer doc spécialisée dans `doc/`
2. Lier depuis [ARCHITECTURE.md](doc/ARCHITECTURE.md) si pertinent
3. Garder à jour lors de changements
4. Archiver l'ancienne version (prefix avec date)

### Release d'une Version

1. Compiler [CHANGELOG.md](CHANGELOG.md) depuis [TRACE.md](TRACE.md)
2. Ajouter version dans [README.md](README.md)
3. Commit avec tag version

---

## ✅ Checklist Documentation

Avant de merger une PR:

- [ ] Code commenté si complexe
- [ ] Commit message clair
- [ ] [TRACE.md](TRACE.md) mis à jour (si décision technique)
- [ ] [TODO.md](TODO.md) mis à jour (si status change)
- [ ] Nouvelle feature documentée (si applicable)

---

## 📱 Accès Rapide

### Pour développeurs

```bash
# Voir l'état actuel
cat QUICK-STATUS.md

# Voir la roadmap
cat TODO.md | head -50

# Voir les bugs passés
grep "Bug #" TRACE.md
```

### Pour Product/Stakeholders

```bash
# Vue d'ensemble
cat README.md

# Version et changements
cat CHANGELOG.md

# Roadmap
cat TODO.md
```

### Pour Maintenance

```bash
# Histoire technique
cat TRACE.md

# Corrections récentes
ls doc/MAINTENANCE*.md

# Architecture
cat doc/ARCHITECTURE.md
```

---

**Dernière mise à jour**: 2026-02-02  
**Statut**: ✅ À jour
