import * as session from '../../domain/session'
import { err, ok } from '../../kernel/result'
import { commit } from '../../kernel/unit-of-work'
import type { UseCase } from '../../kernel/use-case'
import type { SessionRef } from '../commands'
import { type SessionNotFound, sessionNotFound } from '../errors'
import type { Actor, Deps } from '../ports'

export type CompleteSessionError = SessionNotFound | session.WrongSessionState

export type CompleteSession = UseCase<
  Actor,
  SessionRef,
  session.CompletedSession,
  CompleteSessionError
>

export function makeCompleteSession({
  uow,
  clock,
}: Pick<Deps, 'uow' | 'clock'>): CompleteSession {
  return (actor, { sessionId }) =>
    uow(async ({ sessions }) => {
      const stored = await sessions.findById(actor.userId, sessionId)
      if (!stored) return err(sessionNotFound(sessionId))

      const active = session.ensureActive(stored)
      if (active.isErr()) return err(active.error)

      const [completed, event] = session.complete(active.value, clock())
      await sessions.save(completed)
      return ok(commit(completed, event))
    })
}
