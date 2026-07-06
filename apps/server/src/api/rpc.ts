import { contract } from '@gart/contract'
import type { UserId } from '@gart/domain'
import { implement, ORPCError } from '@orpc/server'
import type { Actor, App } from '../app'
import { sessionToDto } from './dto'
import { raise } from './errors'

export type RpcContext = Readonly<{ userId: UserId | null }>

function requireActor(context: RpcContext): Actor {
  if (!context.userId)
    throw new ORPCError('UNAUTHORIZED', { message: 'authentication required' })
  return { userId: context.userId }
}

// The app face: contract-first implementation, one handler per procedure.
// Handlers unwrap use-case Results — success maps to DTOs, failure to raise().
export function makeRouter(app: App) {
  const os = implement(contract).$context<RpcContext>()

  return os.router({
    health: os.health.handler(() => ({ status: 'ok' as const })),

    exercises: {
      list: os.exercises.list.handler(async ({ context, input }) =>
        (await app.exercises.list(requireActor(context), input)).match(
          (v) => v,
          raise,
        ),
      ),
    },

    sessions: {
      listRecent: os.sessions.listRecent.handler(async ({ context, input }) =>
        (await app.sessions.listRecent(requireActor(context), input)).match(
          (found) => found.map(sessionToDto),
          raise,
        ),
      ),
      create: os.sessions.create.handler(async ({ context, input }) =>
        (
          await app.sessions.create(requireActor(context), {
            input,
            origin: input.routineId ? 'routine' : 'adhoc',
          })
        ).match(sessionToDto, raise),
      ),
      start: os.sessions.start.handler(async ({ context, input }) =>
        (await app.sessions.start(requireActor(context), input)).match(
          sessionToDto,
          raise,
        ),
      ),
      logSet: os.sessions.logSet.handler(async ({ context, input }) =>
        (await app.sessions.logSet(requireActor(context), input)).match(
          ({ session, setId }) => ({ session: sessionToDto(session), setId }),
          raise,
        ),
      ),
      complete: os.sessions.complete.handler(async ({ context, input }) =>
        (await app.sessions.complete(requireActor(context), input)).match(
          sessionToDto,
          raise,
        ),
      ),
    },
  })
}
