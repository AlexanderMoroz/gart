import { ok } from '../../kernel/result'
import type { UseCase } from '../../kernel/use-case'
import type { Actor, Deps } from '../ports'
import type { ExerciseFilter, ExerciseListItem } from '../queries'

export type ListExercises = UseCase<Actor, ExerciseFilter, ExerciseListItem[]>

export function makeListExercises({
  exercises,
}: Pick<Deps, 'exercises'>): ListExercises {
  return async (actor, filter) => ok(await exercises.list(actor.userId, filter))
}
