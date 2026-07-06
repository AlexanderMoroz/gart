import { err, ok, session, type UseCase } from '@gart/domain'
import {
  type Actor,
  type Deps,
  type SessionNotFound,
  sessionNotFound,
} from '../ports'

export type StartSessionError = SessionNotFound | session.WrongSessionState

export type StartSession = UseCase<
  Actor,
  { sessionId: string },
  session.ActiveSession,
  StartSessionError
>

export function makeStartSession({
  uow,
  clock,
  events,
}: Pick<Deps, 'uow' | 'clock' | 'events'>): StartSession {
  return (actor, { sessionId }) =>
    uow(async ({ sessions }) => {
      const stored = await sessions.findById(actor.userId, sessionId)
      if (!stored) return err(sessionNotFound(sessionId))

      const planned = session.ensurePlanned(stored)
      if (planned.isErr()) return err(planned.error)

      const [active, event] = session.start(planned.value, clock())
      await sessions.save(active)
      events(event)
      return ok(active)
    })
}
