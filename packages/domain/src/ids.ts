import { brandedId, type IdOf } from './kernel'

// Cross-aggregate identifiers. Aggregates reference each other by id only —
// these live outside any single aggregate module on purpose.

export const UserId = brandedId('UserId')
export type UserId = IdOf<typeof UserId>

export const ExerciseId = brandedId('ExerciseId')
export type ExerciseId = IdOf<typeof ExerciseId>

export const RoutineId = brandedId('RoutineId')
export type RoutineId = IdOf<typeof RoutineId>
