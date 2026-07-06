import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema/index'

export * from './schema/index'

export function createDb(connectionString: string) {
  return drizzle(connectionString, { schema })
}

export type Db = ReturnType<typeof createDb>
