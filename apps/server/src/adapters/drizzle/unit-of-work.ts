import type { Db } from '@gart/db'
import type { Result } from '@gart/domain'
import type { TxRepos, UnitOfWork } from '../../app/ports'
import { makeSessionRepo } from './session-repo'

// drizzle only rolls back on throw — an err Result must not commit, so it
// rides out of the transaction on a sentinel.
class RollbackSignal extends Error {
  constructor(readonly result: Result<unknown, unknown>) {
    super('rollback')
  }
}

export function makeUnitOfWork(db: Db): UnitOfWork {
  return async <T, E>(
    work: (repos: TxRepos) => Promise<Result<T, E>>,
  ): Promise<Result<T, E>> => {
    try {
      return await db.transaction(async (tx) => {
        const result = await work({ sessions: makeSessionRepo(tx) })
        if (result.isErr()) throw new RollbackSignal(result)
        return result
      })
    } catch (error) {
      if (error instanceof RollbackSignal) return error.result as Result<T, E>
      throw error
    }
  }
}
