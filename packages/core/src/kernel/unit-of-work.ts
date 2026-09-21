import type { DomainEvent } from './event'
import type { Result } from './result'

export type Commit<T, E extends DomainEvent = DomainEvent> = Readonly<{
  value: T
  events: readonly E[]
}>

export function commit<T, E extends DomainEvent>(
  value: T,
  ...events: readonly E[]
): Commit<T, E> {
  return { value, events }
}

// An atomic boundary for state-changing use-cases, generic over whatever
// repository set the application defines. The implementing adapter must
// guarantee: everything `work` does through `repos` commits together, an err
// Result (not only a throw) rolls the whole unit back, and the events of a
// Commit are dispatched only after the unit has committed.
export type UnitOfWork<TRepos, TEvent extends DomainEvent = DomainEvent> = <
  T,
  E,
>(
  work: (repos: TRepos) => Promise<Result<Commit<T, TEvent>, E>>,
) => Promise<Result<T, E>>
