import type { CreateSessionInput } from '@gart/contract'
import { ok, session, type UseCase } from '@gart/domain'
import type { Actor, Deps } from '../ports'

export type CreateSessionCommand = Readonly<{
  input: CreateSessionInput
  origin: session.SessionOrigin // the serving face decides, never the client
}>

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
  return (actor, { input, origin }) =>
    uow(async ({ sessions }) => {
      const [planned, event] = session.plan(
        {
          userId: actor.userId,
          origin,
          routineId: input.routineId,
          plannedFor: input.plannedFor ? new Date(input.plannedFor) : undefined,
          note: input.note,
          entries: input.entries,
        },
        clock(),
      )
      await sessions.insert(planned)
      events(event)
      return ok(planned)
    })
}
