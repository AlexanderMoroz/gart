import type * as session from '../../domain/session'
import { ok } from '../../kernel/result'
import type { UseCase } from '../../kernel/use-case'
import type { RecentSessionsQuery } from '../commands'
import type { Actor, Deps } from '../ports'

export type ListRecentSessions = UseCase<
  Actor,
  RecentSessionsQuery,
  session.Session[]
>

export function makeListRecentSessions({
  sessions,
}: Pick<Deps, 'sessions'>): ListRecentSessions {
  return async (actor, query) =>
    ok(await sessions.listRecent(actor.userId, query))
}
