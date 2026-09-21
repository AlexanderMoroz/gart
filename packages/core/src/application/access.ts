import type { ExerciseId } from '../domain/ids'
import { err, ok, type Result } from '../kernel/result'
import { type ExerciseNotFound, exerciseNotFound } from './errors'
import type { Actor, ExerciseCatalog } from './ports'
import type { ExerciseAccess } from './queries'

export const isExerciseVisibleTo =
  (actor: Actor) =>
  (exercise: ExerciseAccess): boolean =>
    !exercise.isArchived &&
    (exercise.scope === 'global' || exercise.ownerId === actor.userId)

export async function ensureExercisesVisible(
  catalog: ExerciseCatalog,
  actor: Actor,
  ids: readonly ExerciseId[],
): Promise<Result<void, ExerciseNotFound>> {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return ok()
  const found = await catalog.findByIds(unique)
  const visible = new Set(
    found.filter(isExerciseVisibleTo(actor)).map((e) => e.id),
  )
  const missing = unique.filter((id) => !visible.has(id))
  return missing.length === 0 ? ok() : err(exerciseNotFound(missing))
}
