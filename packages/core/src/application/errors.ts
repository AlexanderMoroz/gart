import type { ExerciseId } from '../domain/ids'
import type * as session from '../domain/session'
import type { DomainError } from '../kernel/error'

export type SessionNotFound = DomainError<'SessionNotFound'>
export const sessionNotFound = (id: session.SessionId): SessionNotFound => ({
  type: 'SessionNotFound',
  message: `session ${id} not found`,
})

export type ExerciseNotFound = DomainError<
  'ExerciseNotFound',
  { exerciseIds: readonly ExerciseId[] }
>
export const exerciseNotFound = (
  exerciseIds: readonly ExerciseId[],
): ExerciseNotFound => ({
  type: 'ExerciseNotFound',
  message: `unknown exercise ${exerciseIds.join(', ')}`,
  exerciseIds,
})
