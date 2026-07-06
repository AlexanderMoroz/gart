import { makeListExercises } from './exercises/list-exercises'
import type { Deps } from './ports'
import { makeCompleteSession } from './sessions/complete-session'
import { makeCreateSession } from './sessions/create-session'
import { makeListRecentSessions } from './sessions/list-recent-sessions'
import { makeLogSet } from './sessions/log-set'
import { makeStartSession } from './sessions/start-session'

export * from './ports'

// Composition of the application layer. Faces (oRPC, MCP) call these and
// nothing else; adapters implement the ports in Deps.
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
