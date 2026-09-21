import * as session from '../../domain/session'
import { err, ok } from '../../kernel/result'
import { commit } from '../../kernel/unit-of-work'
import type { UseCase } from '../../kernel/use-case'
import { ensureExercisesVisible } from '../access'
import type { CreateSessionCommand } from '../commands'
import type { ExerciseNotFound } from '../errors'
import type { Actor, Deps } from '../ports'

export type CreateSessionError = ExerciseNotFound

export type CreateSession = UseCase<
  Actor,
  CreateSessionCommand,
  session.PlannedSession,
  CreateSessionError
>

export function makeCreateSession({
  uow,
  exercises,
  clock,
}: Pick<Deps, 'uow' | 'exercises' | 'clock'>): CreateSession {
  return async (actor, command) => {
    const visible = await ensureExercisesVisible(
      exercises,
      actor,
      (command.entries ?? []).map((e) => e.exerciseId),
    )
    if (visible.isErr()) return err(visible.error)

    return uow(async ({ sessions }) => {
      const [planned, event] = session.plan(
        { ...command, userId: actor.userId },
        clock(),
      )
      await sessions.insert(planned)
      return ok(commit(planned, event))
    })
  }
}
