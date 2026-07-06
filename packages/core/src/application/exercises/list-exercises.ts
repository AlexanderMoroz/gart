import { ok } from '../../kernel/result'
import type { UseCase } from '../../kernel/use-case'
import type { ExerciseFilter, ExerciseListItem } from '../commands'
import type { Actor, Deps } from '../ports'

export type ListExercises = UseCase<Actor, ExerciseFilter, ExerciseListItem[]>

export function makeListExercises({
  exercises,
}: Pick<Deps, 'exercises'>): ListExercises {
  return async (actor, filter) => ok(await exercises.list(actor.userId, filter))
}
