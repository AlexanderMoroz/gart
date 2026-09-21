import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { equipment, exerciseScope, muscleGroup } from './enums'

// Exercise = Movement × Equipment (× variation). Muscle groups live on the
// Movement and are inherited. Catalog rows are referenced by history —
// never hard-delete, archive instead.

export const movements = pgTable('movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  primaryMuscles: muscleGroup('primary_muscles').array().notNull(),
  secondaryMuscles: muscleGroup('secondary_muscles')
    .array()
    .notNull()
    .default([]),
})

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    movementId: uuid('movement_id')
      .notNull()
      .references(() => movements.id),
    equipment: equipment('equipment').notNull(),
    name: text('name').notNull(),
    variation: text('variation'),
    instructions: text('instructions'),
    scope: exerciseScope('scope').notNull().default('global'),
    ownerId: text('owner_id').references(() => user.id, {
      onDelete: 'cascade',
    }),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('exercises_movement_id_idx').on(t.movementId),
    check(
      'exercises_scope_owner_check',
      sql`("scope" = 'global' AND "owner_id" IS NULL) OR ("scope" = 'user' AND "owner_id" IS NOT NULL)`,
    ),
  ],
)
