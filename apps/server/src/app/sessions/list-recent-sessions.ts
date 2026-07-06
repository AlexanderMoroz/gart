import type { GetRecentSessionsInput } from '@gart/contract'
import { ok, type session, type UseCase } from '@gart/domain'
import type { Actor, Deps } from '../ports'

export type ListRecentSessions = UseCase<
  Actor,
  GetRecentSessionsInput,
  session.Session[]
>

export function makeListRecentSessions({
  sessions,
}: Pick<Deps, 'sessions'>): ListRecentSessions {
  return async (actor, input) =>
    ok(await sessions.listRecent(actor.userId, input))
}
