import type {
  CreateSessionInput,
  ExerciseDto,
  GetRecentSessionsInput,
  ListExercisesInput,
  LogSetInput,
  LogSetOutput,
  SessionDto,
} from '@gart/contract'
import type { Db } from '@gart/db'
import { session, type UserId } from '@gart/domain'
import { notFound, throwDomainError } from './errors'
import { sessionToDto } from './mappers'
import { listExercises } from './repos/exercises'
import {
  findSession,
  insertSession,
  listRecentSessions,
  saveSession,
} from './repos/sessions'

// Application services: one use-case = one aggregate = one transaction.
// Both faces (oRPC procedures and MCP tools) call these — nothing else
// touches repos or domain transitions.

export type Actor = Readonly<{ userId: UserId }>
type OnEvent = (event: session.SessionEvent) => void

export function makeUseCases(db: Db, onEvent: OnEvent = () => {}) {
  return {
    exercises: {
      list: (actor: Actor, input: ListExercisesInput): Promise<ExerciseDto[]> =>
        listExercises(db, actor.userId, input),
    },

    sessions: {
      async listRecent(
        actor: Actor,
        input: GetRecentSessionsInput,
      ): Promise<SessionDto[]> {
        const found = await listRecentSessions(db, actor.userId, input)
        return found.map(sessionToDto)
      },

      async create(
        actor: Actor,
        input: CreateSessionInput,
        origin: session.SessionOrigin,
      ): Promise<SessionDto> {
        const [planned, event] = session.plan(
          {
            userId: actor.userId,
            origin,
            routineId: input.routineId,
            plannedFor: input.plannedFor
              ? new Date(input.plannedFor)
              : undefined,
            note: input.note,
            entries: input.entries,
          },
          new Date(),
        )
        await db.transaction((tx) => insertSession(tx, planned))
        onEvent(event)
        return sessionToDto(planned)
      },

      async start(actor: Actor, sessionId: string): Promise<SessionDto> {
        return db.transaction(async (tx) => {
          const stored =
            (await findSession(tx, actor.userId, sessionId)) ??
            notFound('session')
          const planned = session.ensurePlanned(stored).match(
            (s) => s,
            (e) => throwDomainError(e),
          )
          const [active, event] = session.start(planned, new Date())
          await saveSession(tx, active)
          onEvent(event)
          return sessionToDto(active)
        })
      },

      async logSet(actor: Actor, input: LogSetInput): Promise<LogSetOutput> {
        return db.transaction(async (tx) => {
          const stored =
            (await findSession(tx, actor.userId, input.sessionId)) ??
            notFound('session')
          const active = session.ensureActive(stored).match(
            (s) => s,
            (e) => throwDomainError(e),
          )
          const [next, event] = session.logSet(active, input, new Date()).match(
            (transitioned) => transitioned,
            (e) => throwDomainError(e),
          )
          await saveSession(tx, next)
          onEvent(event)
          return { session: sessionToDto(next), setId: event.payload.setId }
        })
      },

      async complete(actor: Actor, sessionId: string): Promise<SessionDto> {
        return db.transaction(async (tx) => {
          const stored =
            (await findSession(tx, actor.userId, sessionId)) ??
            notFound('session')
          const active = session.ensureActive(stored).match(
            (s) => s,
            (e) => throwDomainError(e),
          )
          const [completed, event] = session.complete(active, new Date())
          await saveSession(tx, completed)
          onEvent(event)
          return sessionToDto(completed)
        })
      },
    },
  }
}

export type UseCases = ReturnType<typeof makeUseCases>
