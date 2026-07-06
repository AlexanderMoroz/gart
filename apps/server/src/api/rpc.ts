import { contract } from '@gart/contract'
import type { app, UserId } from '@gart/core'
import { implement, ORPCError } from '@orpc/server'
import { sessionToDto } from './dto'
import { raise } from './errors'

export type RpcContext = Readonly<{ userId: UserId | null }>

function requireActor(context: RpcContext): app.Actor {
  if (!context.userId)
    throw new ORPCError('UNAUTHORIZED', { message: 'authentication required' })
  return { userId: context.userId }
}

// The app face: contract-first implementation, one handler per procedure.
// Faces own the wire↔core mapping: parsed input → command, domain state →
// DTO, tagged error → raise(). The compiler checks input/command fit.
export function makeRouter(useCases: app.App) {
  const os = implement(contract).$context<RpcContext>()

  return os.router({
    health: os.health.handler(() => ({ status: 'ok' as const })),

    exercises: {
      list: os.exercises.list.handler(async ({ context, input }) =>
        (await useCases.exercises.list(requireActor(context), input)).match(
          (v) => v,
          raise,
        ),
      ),
    },

    sessions: {
      listRecent: os.sessions.listRecent.handler(async ({ context, input }) =>
        (
          await useCases.sessions.listRecent(requireActor(context), input)
        ).match((found) => found.map(sessionToDto), raise),
      ),
      create: os.sessions.create.handler(async ({ context, input }) =>
        (
          await useCases.sessions.create(requireActor(context), {
            origin: input.routineId ? 'routine' : 'adhoc',
            routineId: input.routineId,
            plannedFor: input.plannedFor
              ? new Date(input.plannedFor)
              : undefined,
            note: input.note,
            entries: input.entries,
          })
        ).match(sessionToDto, raise),
      ),
      start: os.sessions.start.handler(async ({ context, input }) =>
        (await useCases.sessions.start(requireActor(context), input)).match(
          sessionToDto,
          raise,
        ),
      ),
      logSet: os.sessions.logSet.handler(async ({ context, input }) =>
        (await useCases.sessions.logSet(requireActor(context), input)).match(
          ({ session, setId }) => ({ session: sessionToDto(session), setId }),
          raise,
        ),
      ),
      complete: os.sessions.complete.handler(async ({ context, input }) =>
        (await useCases.sessions.complete(requireActor(context), input)).match(
          sessionToDto,
          raise,
        ),
      ),
    },
  })
}
