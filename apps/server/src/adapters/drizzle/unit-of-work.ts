import {
  type app,
  type Commit,
  ok,
  type Result,
  type session,
} from '@gart/core'
import type { Db } from '@gart/db'

import { makeSessionRepo } from './session-repo'

// drizzle only rolls back on throw — an err Result must not commit, so it
// rides out of the transaction on a sentinel.
class RollbackSignal extends Error {
  constructor(readonly result: Result<unknown, unknown>) {
    super('rollback')
  }
}

export function makeUnitOfWork(
  db: Pick<Db, 'transaction'>,
  events: app.EventSink,
): app.UnitOfWork {
  return async <T, E>(
    work: (
      repos: app.TxRepos,
    ) => Promise<Result<Commit<T, session.SessionEvent>, E>>,
  ): Promise<Result<T, E>> => {
    let committed: Commit<T, session.SessionEvent>
    try {
      committed = await db.transaction(async (tx) => {
        const result = await work({
          sessions: makeSessionRepo(tx, { forUpdate: true }),
        })
        if (result.isErr()) throw new RollbackSignal(result)
        return result.value
      })
    } catch (error) {
      if (error instanceof RollbackSignal) return error.result as Result<T, E>
      throw error
    }
    for (const event of committed.events) events(event)
    return ok(committed.value)
  }
}
