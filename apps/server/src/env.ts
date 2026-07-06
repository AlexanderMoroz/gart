import { z } from 'zod'

const Env = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('postgres://gart:gart@localhost:5432/gart'),
  // defaults are for local dev only; Coolify injects real values in prod
  BETTER_AUTH_SECRET: z.string().default('dev-secret-change-me'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
})

export const env = Env.parse(process.env)
