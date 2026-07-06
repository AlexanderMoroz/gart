import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer } from 'better-auth/plugins'
import { db } from './db'
import { env } from './env'

// Identity for all three faces (see notes/stack.md). Schema for the auth
// tables is generated: pnpm --filter @gart/server auth:schema
// bearer() lets API/MCP clients send `Authorization: Bearer <session token>`.
// TODO next milestones: expo() plugin for the mobile app; OAuth 2.1 provider
// plugin (discovery + dynamic client registration) for MCP clients.
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [bearer()],
})
