import { createDb } from '@gart/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

const db = createDb(
  process.env.DATABASE_URL ?? 'postgres://gart:gart@localhost:5432/gart',
)

// Identity for all three faces (see notes/stack.md). Schema for these tables
// is generated: pnpm --filter @gart/server auth:schema
// TODO: expo plugin (mobile) + OAuth 2.1 provider plugin (MCP clients) when
// auth gets mounted on Fastify.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
})
