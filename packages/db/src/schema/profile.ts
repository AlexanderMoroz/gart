import {
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { exercises } from './catalog'
import { weightUnit } from './enums'

// Identity/auth lives in better-auth tables; this is app-level profile data.
// Canonical weight storage is ALWAYS kg — units only affect display.
export const profiles = pgTable('profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  units: weightUnit('units').notNull().default('kg'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Durable knowledge of user × exercise: seat height, pin, handles... shown
// next to "last time" context in the active session screen.
export const userExerciseSettings = pgTable(
  'user_exercise_settings',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    settings: jsonb('settings')
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    note: text('note'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.exerciseId] })],
)
