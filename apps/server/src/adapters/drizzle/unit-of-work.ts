import type { app, Result } from '@gart/core'
import type { Db } from '@gart/db'

import { makeSessionRepo } from './session-repo'

// drizzle only rolls back on throw — an err Result must not commit, so it
// rides out of the transaction on a sentinel.
class RollbackSignal extends Error {
  constructor(readonly result: Result<unknown, unknown>) {
    super('rollback')
  }
}

export function makeUnitOfWork(db: Db): app.UnitOfWork {
  return async <T, E>(
    work: (repos: app.TxRepos) => Promise<Result<T, E>>,
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
