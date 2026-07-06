import { oc } from '@orpc/contract'
import { z } from 'zod'
import {
  CreateSessionInput,
  ExerciseDto,
  GetRecentSessionsInput,
  ListExercisesInput,
  LogSetInput,
  LogSetOutput,
  SessionDto,
  SessionRefInput,
} from './schemas'

export * from './schemas'

// Source of truth for every API surface: oRPC routers (mobile app), MCP tool
// schemas, and OpenAPI docs all derive from this contract.
// Killer-flow procedures only (notes/mvp.md); routines/profile/history later.
// TODO: typed errors via oc.errors() once the server error mapping settles.

export const contract = {
  health: oc
    .route({ method: 'GET', path: '/health' })
    .output(z.object({ status: z.literal('ok') })),

  exercises: {
    list: oc
      .route({ method: 'GET', path: '/exercises' })
      .input(ListExercisesInput)
      .output(z.array(ExerciseDto)),
  },

  sessions: {
    listRecent: oc
      .route({ method: 'GET', path: '/sessions' })
      .input(GetRecentSessionsInput)
      .output(z.array(SessionDto)),

    create: oc
      .route({ method: 'POST', path: '/sessions' })
      .input(CreateSessionInput)
      .output(SessionDto),

    start: oc
      .route({ method: 'POST', path: '/sessions/{sessionId}/start' })
      .input(SessionRefInput)
      .output(SessionDto),

    logSet: oc
      .route({ method: 'POST', path: '/sessions/{sessionId}/sets' })
      .input(LogSetInput)
      .output(LogSetOutput),

    complete: oc
      .route({ method: 'POST', path: '/sessions/{sessionId}/complete' })
      .input(SessionRefInput)
      .output(SessionDto),
  },
}

export type Contract = typeof contract
