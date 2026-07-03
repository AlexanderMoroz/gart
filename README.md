# Gart

Open-source gym training companion: mobile app + backend + MCP server, so an AI
assistant can plan sessions, log workouts, and analyze progress directly.

**Гарт** (Belarusian) — the temper steel gets from fire; resilience earned
through hard work.

## Layout

```
apps/
  mobile/     Expo (React Native) app — iOS first, FSD-simplified layers
  server/     Fastify — one deployable, three faces: oRPC + MCP + better-auth
  web/        gart.fit — static placeholder landing page (Vite + React)
packages/
  contract/   oRPC contract + Zod schemas — source of truth for app & MCP tools
  domain/     rich-domain aggregates, pure TS, zero IO deps
  db/         Drizzle schema + migrations (Postgres)
  tooling/    shared tsconfig bases (lint/format = Biome, biome.json at root)
```

Dependency arrows point inward only: `server → contract/domain/db`,
`mobile/web → contract`, `domain → nothing`.

## Getting started

```sh
# pnpm 11 per the packageManager field — via corepack enable,
# npm i -g pnpm, or npx pnpm@11 <cmd>
pnpm install
pnpm dev               # all dev servers via turbo
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Per app:

- `pnpm --filter @gart/server dev` — API on :3000 (needs Postgres, see apps/server/.env.example)
- `pnpm --filter @gart/web dev` — landing page
- `pnpm --filter @gart/mobile start` — Expo dev server (custom dev client; Expo Go can't run HealthKit later)

## Status

Skeleton only — the data model (and with it the real contract, domain
aggregates, and DB schema) lands after the data-modeling session. Notes live
outside this repo in `../notes/`.

## Notes

- pnpm isolated node_modules is supported by Expo SDK 54+. If a React Native
  dep ever fails to resolve, set `nodeLinker: hoisted` in pnpm-workspace.yaml.
- CI: lint + typecheck + test + build on PR/push. CD: manual workflow builds
  the server image to GHCR; Coolify webhook hookup is a TODO.
