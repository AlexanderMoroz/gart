import { err, ok, session, type UseCase } from '@gart/domain'
import {
  type Actor,
  type Deps,
  type SessionNotFound,
  sessionNotFound,
} from '../ports'

export type CompleteSessionError = SessionNotFound | session.WrongSessionState

export type CompleteSession = UseCase<
  Actor,
  { sessionId: string },
  session.CompletedSession,
  CompleteSessionError
>

export function makeCompleteSession({
  uow,
  clock,
  events,
}: Pick<Deps, 'uow' | 'clock' | 'events'>): CompleteSession {
  return (actor, { sessionId }) =>
    uow(async ({ sessions }) => {
      const stored = await sessions.findById(actor.userId, sessionId)
      if (!stored) return err(sessionNotFound(sessionId))

      const active = session.ensureActive(stored)
      if (active.isErr()) return err(active.error)

      const [completed, event] = session.complete(active.value, clock())
      await sessions.save(completed)
      events(event)
      return ok(completed)
    })
}
