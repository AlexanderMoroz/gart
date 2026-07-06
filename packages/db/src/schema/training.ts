import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { exercises } from './catalog'
import {
  sessionExerciseStatus,
  sessionOrigin,
  sessionStatus,
  sessionType,
  setType,
} from './enums'

const weightKg = (name: string) =>
  numeric(name, { precision: 6, scale: 2, mode: 'number' })
const rpe = (name: string) =>
  numeric(name, { precision: 3, scale: 1, mode: 'number' })

// Reusable session template ("Push Day A"). Instantiating copies prescriptions
// into a new planned session — a snapshot, so later routine edits don't
// rewrite history.
export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const routineExercises = pgTable(
  'routine_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    position: integer('position').notNull(),
    defaultSets: integer('default_sets'),
    // single target values for MVP — rep ranges deliberately deferred (§6)
    targetWeightKg: weightKg('target_weight_kg'),
    targetReps: integer('target_reps'),
    targetRpe: rpe('target_rpe'),
  },
  (t) => [index('routine_exercises_routine_id_idx').on(t.routineId)],
)

// Training sessions (not to be confused with better-auth's `session` table).
// One identity through the whole lifecycle: planned → active → completed | abandoned.
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: sessionType('type').notNull().default('strength'),
    status: sessionStatus('status').notNull().default('planned'),
    origin: sessionOrigin('origin').notNull(),
    routineId: uuid('routine_id').references(() => routines.id, {
      onDelete: 'set null',
    }),
    plannedFor: date('planned_for', { mode: 'date' }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    abandonedAt: timestamp('abandoned_at', { withTimezone: true }),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('sessions_user_id_status_idx').on(t.userId, t.status),
    // "last time" / history queries
    index('sessions_user_id_completed_at_idx').on(t.userId, t.completedAt),
  ],
)

export const sessionExercises = pgTable(
  'session_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id),
    position: integer('position').notNull(),
    status: sessionExerciseStatus('status').notNull().default('planned'),
    // option (a) from data-model.md §7 — cheapest, migrates forward to
    // Block/Segment mechanically when non-strength sessions land
    supersetGroup: integer('superset_group'),
    note: text('note'),
  },
  (t) => [
    index('session_exercises_session_id_idx').on(t.sessionId),
    index('session_exercises_exercise_id_idx').on(t.exerciseId, t.sessionId),
  ],
)

// A set carries prescription (target_*) and/or performance (actual_*):
// ad-hoc → actuals only · planned-not-done → targets only · done → both.
export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionExerciseId: uuid('session_exercise_id')
      .notNull()
      .references(() => sessionExercises.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    setType: setType('set_type').notNull().default('working'),
    targetWeightKg: weightKg('target_weight_kg'),
    targetReps: integer('target_reps'),
    targetRpe: rpe('target_rpe'),
    actualWeightKg: weightKg('actual_weight_kg'),
    actualReps: integer('actual_reps'),
    actualRpe: rpe('actual_rpe'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    note: text('note'),
  },
  (t) => [index('sets_session_exercise_id_idx').on(t.sessionExerciseId)],
)
