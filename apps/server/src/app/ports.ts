import type {
  ExerciseDto,
  GetRecentSessionsInput,
  ListExercisesInput,
} from '@gart/contract'
import type { DomainError, Result, session, UserId } from '@gart/domain'

// The application layer's view of the outside world. Implementations live in
// src/adapters/ — use-cases only ever see these types.

export type Actor = Readonly<{ userId: UserId }>

export type Clock = () => Date

export type EventSink = (event: session.SessionEvent) => void

export type SessionRepo = {
  findById(
    userId: UserId,
    sessionId: string,
  ): Promise<session.Session | undefined>
  insert(s: session.Session): Promise<void>
  save(s: session.Session): Promise<void>
  listRecent(
    userId: UserId,
    input: GetRecentSessionsInput,
  ): Promise<session.Session[]>
}

// Read model over the catalog — returns wire DTOs directly, no aggregate.
export type ExerciseCatalog = {
  list(userId: UserId, input: ListExercisesInput): Promise<ExerciseDto[]>
}

// Atomic boundary for state-changing use-cases. The adapter must roll the
// transaction back when the callback resolves to an err Result.
export type TxRepos = Readonly<{ sessions: SessionRepo }>
export type UnitOfWork = <T, E>(
  work: (repos: TxRepos) => Promise<Result<T, E>>,
) => Promise<Result<T, E>>

export type Deps = Readonly<{
  uow: UnitOfWork
  sessions: SessionRepo
  exercises: ExerciseCatalog
  clock: Clock
  events: EventSink
}>

export type SessionNotFound = DomainError<'SessionNotFound'>
export const sessionNotFound = (id: string): SessionNotFound => ({
  type: 'SessionNotFound',
  message: `session ${id} not found`,
})
