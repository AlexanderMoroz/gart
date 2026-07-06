import type { LogSetInput } from '@gart/contract'
import { err, ok, session, type UseCase } from '@gart/domain'
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

export type LogSet = UseCase<Actor, LogSetInput, LogSetResult, LogSetError>

export function makeLogSet({
  uow,
  clock,
  events,
}: Pick<Deps, 'uow' | 'clock' | 'events'>): LogSet {
  return (actor, input) =>
    uow(async ({ sessions }) => {
      const stored = await sessions.findById(actor.userId, input.sessionId)
      if (!stored) return err(sessionNotFound(input.sessionId))

      const active = session.ensureActive(stored)
      if (active.isErr()) return err(active.error)

      const logged = session.logSet(active.value, input, clock())
      if (logged.isErr()) return err(logged.error)

      const [next, event] = logged.value
      await sessions.save(next)
      events(event)
      return ok({ session: next, setId: event.payload.setId })
    })
}
