import type { UserId } from '../domain/ids'
import type * as session from '../domain/session'
import type { DomainError } from '../kernel/error'
import type { Result } from '../kernel/result'
import type {
  ExerciseFilter,
  ExerciseListItem,
  RecentSessionsQuery,
} from './commands'

// The application layer's view of the outside world. Implementations live in
// the deployable's adapters — use-cases only ever see these types.

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
    query: RecentSessionsQuery,
  ): Promise<session.Session[]>
}

export type ExerciseCatalog = {
  list(userId: UserId, filter: ExerciseFilter): Promise<ExerciseListItem[]>
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
