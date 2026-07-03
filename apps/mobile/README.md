# @gart/mobile

Expo (React Native) app, iOS first. Based on the Expo SDK 57 default template —
run `npm run reset-project` (or delete the example screens by hand) once real
screens start landing.

## Architecture — FSD simplified

`src/app` (Expo Router routes, doubles as the pages layer) → `src/features` →
`src/entities` → `src/shared`. Imports point downward only.

## Dev

```sh
pnpm --filter @gart/mobile start
```

HealthKit (v1.1) will require a custom dev client (`expo run:ios`) — Expo Go
can't load native modules outside its SDK set.
