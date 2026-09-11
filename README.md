# NOVA

**Imagine It. Build It. Live It.**

NOVA is a digital civilization and global community for inventors, scientists, engineers, creators, artists, gamers and entrepreneurs who want to turn ambitious ideas into reality.

## Product

- **Cities** — Nexus, Forge, Aurora, Genesis, Horizon, Quantum, Gaia and Arcade
- **Dream Factory** — IDEA → DESIGN → RESEARCH → PROTOTYPE → DEVELOP → DEPLOY
- **Nexa** — conceptual NOVA economy using ◈ / NXA
- **Constitution** — founding principles, rights and accountable governance
- **Citizenship** — founding-citizen onboarding
- **Citizen OS** — digital passport, projects, civic activity and future platform services

## Stack

React + Vite + React Router + Lucide React. Styling is a lightweight custom CSS system with no Tailwind dependency.

## Development

```bash
npm install
npm run dev
npm run build
```

## Deployment

The `main` branch is the production web branch. GitHub Pages deploys the Vite `dist` output through `.github/workflows/deploy-pages.yml`.

NOVA is initially a digital civilization/global community, not a claim of legal sovereignty. Nexa is conceptual demonstration data and is not a cryptocurrency, bank, payment service or investment product.

## Local NOVA API

NOVA includes a small, dependency-free Node API for local development and prototyping. It persists Dream Factory proposals and founding-citizen prototype records to `data/nova.json` (which is intentionally ignored by Git).

```bash
npm run server       # API: http://127.0.0.1:8787
npm run dev          # web: http://127.0.0.1:5173/webapp/
```

Vite proxies `/api` requests to the local API while developing. The available endpoints are:

- `GET /api/health`
- `GET /api/projects?q=`
- `POST /api/projects`
- `POST /api/citizens`

This API is a local prototype, not a production identity, financial, authentication, or custody system. Before any public deployment, add a production database, authentication, rate limiting, email-verification, privacy controls, secure configuration, and a hosted API origin. GitHub Pages can serve the static frontend but cannot host the Node API.
