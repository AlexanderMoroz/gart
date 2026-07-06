import * as session from '../../domain/session'
import { err, ok } from '../../kernel/result'
import type { UseCase } from '../../kernel/use-case'
import type { LogSetCommand } from '../commands'
import {
  type Actor,
  type Deps,
  type SessionNotFound,
  sessionNotFound,
} from '../ports'

export type LogSetError =
  | SessionNotFound
  | session.WrongSessionState
  | session.LogSetError

export type LogSetResult = Readonly<{
  session: session.ActiveSession
  setId: session.SetId
}>

export type LogSet = UseCase<Actor, LogSetCommand, LogSetResult, LogSetError>

export function makeLogSet({
  uow,
  clock,
  events,
}: Pick<Deps, 'uow' | 'clock' | 'events'>): LogSet {
  return (actor, command) =>
    uow(async ({ sessions }) => {
      const stored = await sessions.findById(actor.userId, command.sessionId)
      if (!stored) return err(sessionNotFound(command.sessionId))

      const active = session.ensureActive(stored)
      if (active.isErr()) return err(active.error)

      const logged = session.logSet(active.value, command, clock())
      if (logged.isErr()) return err(logged.error)

      const [next, event] = logged.value
      await sessions.save(next)
      events(event)
      return ok({ session: next, setId: event.payload.setId })
    })
}
