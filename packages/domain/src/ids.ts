import { z } from 'zod'
import { brandedId, type IdOf } from './kernel'

// Cross-aggregate identifiers. Aggregates reference each other by id only —
// these live outside any single aggregate module on purpose.

// Not a uuid: user ids come from better-auth, which uses its own id format.
export const UserId = z.string().min(1).brand<'UserId'>()
export type UserId = z.output<typeof UserId>

export const ExerciseId = brandedId('ExerciseId')
export type ExerciseId = IdOf<typeof ExerciseId>

export const RoutineId = brandedId('RoutineId')
export type RoutineId = IdOf<typeof RoutineId>
