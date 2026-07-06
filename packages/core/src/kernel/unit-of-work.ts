import type { Result } from './result'

// An atomic boundary for state-changing use-cases, generic over whatever
// repository set the application defines. The implementing adapter must
// guarantee: everything `work` does through `repos` commits together, and an
// err Result (not only a throw) rolls the whole unit back.
export type UnitOfWork<TRepos> = <T, E>(
  work: (repos: TRepos) => Promise<Result<T, E>>,
) => Promise<Result<T, E>>
