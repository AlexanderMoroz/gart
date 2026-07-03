# Build from the repo root: docker build -f apps/server/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @gart/server...
RUN pnpm --filter @gart/server build

# tsup bundles all deps into dist/, so the runtime image is just node + dist.
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/server/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
