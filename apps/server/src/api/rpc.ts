import { contract } from '@gart/contract'
import type { UserId } from '@gart/domain'
import { implement, ORPCError } from '@orpc/server'
import type { Actor, UseCases } from '../use-cases'

export type RpcContext = Readonly<{ userId: UserId | null }>

function requireActor(context: RpcContext): Actor {
  if (!context.userId)
    throw new ORPCError('UNAUTHORIZED', { message: 'authentication required' })
  return { userId: context.userId }
}

// The app face: contract-first implementation, one handler per procedure,
// all real work delegated to use-cases (shared with the MCP face).
export function makeRouter(uc: UseCases) {
  const os = implement(contract).$context<RpcContext>()

  return os.router({
    health: os.health.handler(() => ({ status: 'ok' as const })),

    exercises: {
      list: os.exercises.list.handler(({ context, input }) =>
        uc.exercises.list(requireActor(context), input),
      ),
    },

    sessions: {
      listRecent: os.sessions.listRecent.handler(({ context, input }) =>
        uc.sessions.listRecent(requireActor(context), input),
      ),
      create: os.sessions.create.handler(({ context, input }) =>
        uc.sessions.create(
          requireActor(context),
          input,
          input.routineId ? 'routine' : 'adhoc',
        ),
      ),
      start: os.sessions.start.handler(({ context, input }) =>
        uc.sessions.start(requireActor(context), input.sessionId),
      ),
      logSet: os.sessions.logSet.handler(({ context, input }) =>
        uc.sessions.logSet(requireActor(context), input),
      ),
      complete: os.sessions.complete.handler(({ context, input }) =>
        uc.sessions.complete(requireActor(context), input.sessionId),
      ),
    },
  })
}
