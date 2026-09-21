import { z } from 'zod'

const Env = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
})

const parsed = Env.safeParse(process.env)
if (!parsed.success) {
  console.error(`invalid environment:\n${z.prettifyError(parsed.error)}`)
  process.exit(1)
}

export const env = parsed.data
