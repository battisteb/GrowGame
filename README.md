# GrowGame

> Personal discipline gamification — turn daily habits into an RPG-style adventure where your character evolves as your real-life discipline does.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![Stack](https://img.shields.io/badge/stack-React%20Native%20%7C%20Expo%20%7C%20TypeScript%20%7C%20Supabase-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

**GrowGame** is a mobile app that gamifies personal discipline across five life domains:

- 📚 **Studies**
- 🏋️ **Sport**
- 🧘 **Meditation**
- 📖 **Reading**
- 🤸 **Stretching**

Each domain has its own character that levels up based on the real actions you log every day. Miss a day, your character stalls. Keep going, they grow. The core hypothesis: turning discipline into a visible progression system helps sustain long-term habits.

<!-- Screenshots — replace when available -->
<!--
<p align="center">
  <img src="doc/screenshots/home.png" width="230" alt="Home screen"/>
  <img src="doc/screenshots/quest.png" width="230" alt="Quests"/>
  <img src="doc/screenshots/stats.png" width="230" alt="Statistics"/>
</p>
-->

> Screenshots coming soon.

---

## Features

- ✅ Track daily actions across 5 life domains
- ✅ Character progression system (XP, levels, evolution)
- ✅ Quests and achievements
- ✅ Leaderboard
- ✅ Statistics and history
- ✅ Local push notifications
- ✅ Animated UI

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile framework | **React Native** + **Expo** |
| Language | **TypeScript** |
| Navigation | **Expo Router** |
| State management | **Zustand** |
| Backend / Auth / DB | **Supabase** (PostgreSQL) |
| Package management | **npm** workspaces (monorepo) |

---

## Project structure

```
GrowGame/
├── apps/
│   └── mobile/              # Main React Native (Expo) application
├── packages/
│   └── shared/              # Shared code between future apps
├── supabase/
│   └── migrations/          # Database schema migrations
├── doc/                     # Design docs, architecture notes
├── ARCHITECTURE.md          # High-level architecture overview
├── SETUP.md                 # Detailed setup instructions
├── CONTRIBUTING.md          # Contribution guidelines
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js **18+**
- npm **9+**
- [Expo Go](https://expo.dev/client) installed on a physical device (iOS or Android)
- A [Supabase](https://supabase.com) project (free tier is enough) for the backend

### Installation

```bash
# Clone the repository
git clone https://github.com/battisteb/GrowGame.git
cd GrowGame

# Install dependencies
npm install

# Configure environment
cp apps/mobile/.env.example apps/mobile/.env
# Then fill in your Supabase URL and anon key
```

### Run

```bash
npm start
```

Scan the QR code with **Expo Go** to launch the app on your device.

---

## Available scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run typecheck` | Run the TypeScript compiler in check mode |

See [`SETUP.md`](SETUP.md) for platform-specific setup instructions.

---

## Documentation

- [`SETUP.md`](SETUP.md) — full setup guide
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — high-level architecture
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to contribute
- [`ROADMAP.md`](ROADMAP.md) — planned features and priorities

---

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for the full backlog. Highlights on the near-term list:

- [ ] Onboarding and tutorial
- [ ] Multi-device sync polish
- [ ] iOS and Android release builds
- [ ] Optional social layer (challenges between friends)

---

## Author

Built as a personal project by **Battiste Boungo** — final-year computer engineering student at Polytech Marseille.

- 🌐 [LinkedIn](https://linkedin.com/in/battiste-boungo-793512300)
- 💻 [GitHub](https://github.com/battisteb)

---

## License

This project is released under the **MIT License** — see [`LICENSE`](LICENSE) for details.
