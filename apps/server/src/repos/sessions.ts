import { sessionExercises, sessions, sets } from '@gart/db'
import type { session, UserId } from '@gart/domain'
import { and, desc, eq, inArray } from 'drizzle-orm'
import type { DbLike } from '../db'
import { sessionToDomain, sessionToRows } from '../mappers'

async function loadChildren(dbx: DbLike, sessionIds: string[]) {
  if (sessionIds.length === 0) return { entryRows: [], setRows: [] }
  const entryRows = await dbx
    .select()
    .from(sessionExercises)
    .where(inArray(sessionExercises.sessionId, sessionIds))
  const entryIds = entryRows.map((e) => e.id)
  const setRows =
    entryIds.length === 0
      ? []
      : await dbx
          .select()
          .from(sets)
          .where(inArray(sets.sessionExerciseId, entryIds))
  return { entryRows, setRows }
}

export async function findSession(
  dbx: DbLike,
  userId: UserId,
  sessionId: string,
): Promise<session.Session | undefined> {
  const rows = await dbx
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .limit(1)
  const row = rows[0]
  if (!row) return undefined
  const { entryRows, setRows } = await loadChildren(dbx, [row.id])
  return sessionToDomain(row, entryRows, setRows)
}

export async function listRecentSessions(
  dbx: DbLike,
  userId: UserId,
  filter: { status?: session.SessionStatus; limit: number },
): Promise<session.Session[]> {
  const rows = await dbx
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        filter.status ? eq(sessions.status, filter.status) : undefined,
      ),
    )
    .orderBy(desc(sessions.createdAt))
    .limit(filter.limit)
  const { entryRows, setRows } = await loadChildren(
    dbx,
    rows.map((r) => r.id),
  )
  return rows.map((row) =>
    sessionToDomain(
      row,
      entryRows.filter((e) => e.sessionId === row.id),
      setRows,
    ),
  )
}

export async function insertSession(
  dbx: DbLike,
  s: session.Session,
): Promise<void> {
  const { sessionRow, entryRows, setRows } = sessionToRows(s)
  await dbx.insert(sessions).values(sessionRow)
  if (entryRows.length > 0) await dbx.insert(sessionExercises).values(entryRows)
  if (setRows.length > 0) await dbx.insert(sets).values(setRows)
}

// Replace strategy: entries/sets are small (≤ dozens per session) and the
// aggregate is saved as a whole — delete + reinsert beats diffing.
export async function saveSession(
  dbx: DbLike,
  s: session.Session,
): Promise<void> {
  const { sessionRow, entryRows, setRows } = sessionToRows(s)
  await dbx
    .update(sessions)
    .set({ ...sessionRow, updatedAt: new Date() })
    .where(eq(sessions.id, s.id))
  await dbx.delete(sessionExercises).where(eq(sessionExercises.sessionId, s.id))
  if (entryRows.length > 0) await dbx.insert(sessionExercises).values(entryRows)
  if (setRows.length > 0) await dbx.insert(sets).values(setRows)
}
