import * as session from '../../domain/session'
import { err, ok } from '../../kernel/result'
import { commit } from '../../kernel/unit-of-work'
import type { UseCase } from '../../kernel/use-case'
import { ensureExercisesVisible } from '../access'
import type { LogSetCommand } from '../commands'
import {
  type ExerciseNotFound,
  type SessionNotFound,
  sessionNotFound,
} from '../errors'
import type { Actor, Deps } from '../ports'

export type LogSetError =
  | SessionNotFound
  | ExerciseNotFound
  | session.WrongSessionState
  | session.LogSetError

export type LogSetResult = Readonly<{
  session: session.ActiveSession
  setId: session.SetId
}>

export type LogSet = UseCase<Actor, LogSetCommand, LogSetResult, LogSetError>

export function makeLogSet({
  uow,
  exercises,
  clock,
}: Pick<Deps, 'uow' | 'exercises' | 'clock'>): LogSet {
  return async (actor, command) => {
    const visible = await ensureExercisesVisible(exercises, actor, [
      command.exerciseId,
    ])
    if (visible.isErr()) return err(visible.error)

    return uow(async ({ sessions }) => {
      const stored = await sessions.findById(actor.userId, command.sessionId)
      if (!stored) return err(sessionNotFound(command.sessionId))

      const active = session.ensureActive(stored)
      if (active.isErr()) return err(active.error)

      const logged = session.logSet(active.value, command, clock())
      if (logged.isErr()) return err(logged.error)

      const [next, event] = logged.value
      await sessions.save(next)
      return ok(commit({ session: next, setId: event.payload.setId }, event))
    })
  }
}
