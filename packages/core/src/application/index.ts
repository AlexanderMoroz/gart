import { makeListExercises } from './exercises/list-exercises'
import type { Deps } from './ports'
import { makeCompleteSession } from './sessions/complete-session'
import { makeCreateSession } from './sessions/create-session'
import { makeListRecentSessions } from './sessions/list-recent-sessions'
import { makeLogSet } from './sessions/log-set'
import { makeStartSession } from './sessions/start-session'

export * from './commands'
export * from './exercises/list-exercises'
export * from './ports'
export * from './sessions/complete-session'
export * from './sessions/create-session'
export * from './sessions/list-recent-sessions'
export * from './sessions/log-set'
export * from './sessions/start-session'

// Composition of the application layer. Deployables provide adapters for the
// ports in Deps; faces (oRPC, MCP, CLI, ...) call the returned use-cases.
export function makeApp(deps: Deps) {
  return {
    exercises: {
      list: makeListExercises(deps),
    },
    sessions: {
      create: makeCreateSession(deps),
      start: makeStartSession(deps),
      logSet: makeLogSet(deps),
      complete: makeCompleteSession(deps),
      listRecent: makeListRecentSessions(deps),
    },
  }
}

export type App = ReturnType<typeof makeApp>
