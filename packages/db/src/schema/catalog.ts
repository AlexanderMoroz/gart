import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { equipment, muscleGroup } from './enums'

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
    // NULL = global catalog entry; set = user's custom exercise
    ownerId: text('owner_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('exercises_movement_id_idx').on(t.movementId)],
)
