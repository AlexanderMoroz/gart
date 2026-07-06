import { createDb, type Db } from '@gart/db'
import { env } from './env'

export const db: Db = createDb(env.DATABASE_URL)

// Everything drizzle exposes on both a database and a transaction — repos
// accept this so use-cases decide the transaction boundary.
export type DbLike = Pick<Db, 'select' | 'insert' | 'update' | 'delete'>
