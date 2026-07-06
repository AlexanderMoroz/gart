import type { ExerciseDto, ListExercisesInput } from '@gart/contract'
import { ok, type UseCase } from '@gart/domain'
import type { Actor, Deps } from '../ports'

export type ListExercises = UseCase<Actor, ListExercisesInput, ExerciseDto[]>

export function makeListExercises({
  exercises,
}: Pick<Deps, 'exercises'>): ListExercises {
  return async (actor, input) => ok(await exercises.list(actor.userId, input))
}
