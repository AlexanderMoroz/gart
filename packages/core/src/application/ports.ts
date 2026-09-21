import type { ExerciseId, UserId } from '../domain/ids'
import type * as session from '../domain/session'
import type { UnitOfWork as KernelUnitOfWork } from '../kernel/unit-of-work'
import type {
  ExerciseAccess,
  ExerciseFilter,
  ExerciseListItem,
  RecentSessionsQuery,
} from './queries'

// The application layer's view of the outside world. Implementations live in
// the deployable's adapters — use-cases only ever see these types.

export type Actor = Readonly<{ userId: UserId }>

export type Clock = () => Date

export type EventSink = (event: session.SessionEvent) => void

export type SessionRepo = {
  findById(
    owner: UserId,
    sessionId: session.SessionId,
  ): Promise<session.Session | undefined>
  insert(s: session.Session): Promise<void>
  save(s: session.Session): Promise<void>
  listRecent(
    owner: UserId,
    query: RecentSessionsQuery,
  ): Promise<session.Session[]>
}

export type ExerciseCatalog = {
  list(viewer: UserId, filter: ExerciseFilter): Promise<ExerciseListItem[]>
  findByIds(ids: readonly ExerciseId[]): Promise<ExerciseAccess[]>
}

// Atomic boundary for state-changing use-cases — the kernel's generic
// UnitOfWork specialized to this application's repository set.
export type TxRepos = Readonly<{ sessions: SessionRepo }>
export type UnitOfWork = KernelUnitOfWork<TxRepos, session.SessionEvent>

export type Deps = Readonly<{
  uow: UnitOfWork
  sessions: SessionRepo
  exercises: ExerciseCatalog
  clock: Clock
}>
