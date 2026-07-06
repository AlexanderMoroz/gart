import { pgEnum } from 'drizzle-orm/pg-core'

// Locked at maximum granularity (notes/data-model.md §5) — grouping and
// filtering must be reliable, so enum, not free text.
export const muscleGroup = pgEnum('muscle_group', [
  'chest',
  'upper_back',
  'lats',
  'traps',
  'lower_back',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'adductors',
  'abductors',
  'hip_flexors',
  'abs',
  'obliques',
  'calves',
  'neck',
  'full_body',
])

export const equipment = pgEnum('equipment', [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'band',
  'kettlebell',
  'other',
])

export const weightUnit = pgEnum('weight_unit', ['kg', 'lb'])

export const sessionType = pgEnum('session_type', ['strength'])
export const sessionStatus = pgEnum('session_status', [
  'planned',
  'active',
  'completed',
  'abandoned',
])
export const sessionOrigin = pgEnum('session_origin', [
  'mcp',
  'routine',
  'adhoc',
])
export const sessionExerciseStatus = pgEnum('session_exercise_status', [
  'planned',
  'done',
  'skipped',
])
export const setType = pgEnum('set_type', [
  'warmup',
  'working',
  'drop',
  'failure',
])

export const healthMetricType = pgEnum('health_metric_type', [
  'heart_rate',
  'active_calories',
  'body_weight',
])
export const healthSampleSource = pgEnum('health_sample_source', [
  'healthkit',
  'manual',
])
