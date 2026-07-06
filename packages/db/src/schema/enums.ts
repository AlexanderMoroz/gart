import { EQUIPMENT, MUSCLE_GROUPS, SET_TYPES, session } from '@gart/domain'
import { pgEnum } from 'drizzle-orm/pg-core'

// Value lists live in @gart/domain (single source of truth for db, contract,
// and MCP tool schemas). This file only binds them to pg enum types.

export const muscleGroup = pgEnum('muscle_group', MUSCLE_GROUPS)
export const equipment = pgEnum('equipment', EQUIPMENT)
export const setType = pgEnum('set_type', SET_TYPES)

export const sessionType = pgEnum('session_type', session.SESSION_TYPES)
export const sessionStatus = pgEnum('session_status', session.SESSION_STATUSES)
export const sessionOrigin = pgEnum('session_origin', session.SESSION_ORIGINS)
export const sessionExerciseStatus = pgEnum(
  'session_exercise_status',
  session.ENTRY_STATUSES,
)

// db-local for now — not yet ubiquitous-language terms
export const weightUnit = pgEnum('weight_unit', ['kg', 'lb'])
export const healthMetricType = pgEnum('health_metric_type', [
  'heart_rate',
  'active_calories',
  'body_weight',
])
export const healthSampleSource = pgEnum('health_sample_source', [
  'healthkit',
  'manual',
])
