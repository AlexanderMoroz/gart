import * as session from '../../domain/session'
import { err, ok } from '../../kernel/result'
import { commit } from '../../kernel/unit-of-work'
import type { UseCase } from '../../kernel/use-case'
import type { SessionRef } from '../commands'
import { type SessionNotFound, sessionNotFound } from '../errors'
import type { Actor, Deps } from '../ports'

export type StartSessionError = SessionNotFound | session.WrongSessionState

export type StartSession = UseCase<
  Actor,
  SessionRef,
  session.ActiveSession,
  StartSessionError
>

export function makeStartSession({
  uow,
  clock,
}: Pick<Deps, 'uow' | 'clock'>): StartSession {
  return (actor, { sessionId }) =>
    uow(async ({ sessions }) => {
      const stored = await sessions.findById(actor.userId, sessionId)
      if (!stored) return err(sessionNotFound(sessionId))

      const planned = session.ensurePlanned(stored)
      if (planned.isErr()) return err(planned.error)

      const [active, event] = session.start(planned.value, clock())
      await sessions.save(active)
      return ok(commit(active, event))
    })
}
