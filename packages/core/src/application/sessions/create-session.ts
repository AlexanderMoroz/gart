import * as session from '../../domain/session'
import { ok } from '../../kernel/result'
import type { UseCase } from '../../kernel/use-case'
import type { CreateSessionCommand } from '../commands'
import type { Actor, Deps } from '../ports'

export type CreateSession = UseCase<
  Actor,
  CreateSessionCommand,
  session.PlannedSession
>

export function makeCreateSession({
  uow,
  clock,
  events,
}: Pick<Deps, 'uow' | 'clock' | 'events'>): CreateSession {
  return (actor, command) =>
    uow(async ({ sessions }) => {
      const [planned, event] = session.plan(
        { ...command, userId: actor.userId },
        clock(),
      )
      await sessions.insert(planned)
      events(event)
      return ok(planned)
    })
}
