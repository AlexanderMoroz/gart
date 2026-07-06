import type { sessionExercises, sessions, sets } from '@gart/db'
import type {
  ExerciseId,
  Performance,
  Prescription,
  Reps,
  RoutineId,
  Rpe,
  session,
  UserId,
  WeightKg,
} from '@gart/domain'

export type SessionRow = typeof sessions.$inferSelect
export type EntryRow = typeof sessionExercises.$inferSelect
export type SetRow = typeof sets.$inferSelect

export type NewSessionRow = typeof sessions.$inferInsert
export type NewEntryRow = typeof sessionExercises.$inferInsert
export type NewSetRow = typeof sets.$inferInsert

const opt = <T>(value: T | null): T | undefined => value ?? undefined

function must<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`corrupt row: ${what} is null`)
  return value
}

// ── rows → domain ───────────────────────────────────────────────────────────
// The only place raw strings/numbers become branded types: the data was
// validated by the contract on the way in, so the casts are the trust boundary.

function setToDomain(row: SetRow): session.SessionSet {
  const hasPrescription =
    row.targetWeightKg !== null ||
    row.targetReps !== null ||
    row.targetRpe !== null
  const prescription: Prescription | undefined = hasPrescription
    ? {
        weightKg: opt(row.targetWeightKg) as WeightKg | undefined,
        reps: opt(row.targetReps) as Reps | undefined,
        rpe: opt(row.targetRpe) as Rpe | undefined,
      }
    : undefined
  // completedAt is the performance discriminator — logSet always stamps it
  const performance: Performance | undefined = row.completedAt
    ? {
        weightKg: opt(row.actualWeightKg) as WeightKg | undefined,
        reps: opt(row.actualReps) as Reps | undefined,
        rpe: opt(row.actualRpe) as Rpe | undefined,
        completedAt: row.completedAt,
      }
    : undefined
  return {
    id: row.id as session.SetId,
    position: row.position,
    setType: row.setType,
    prescription,
    performance,
    note: opt(row.note),
  }
}

export function sessionToDomain(
  row: SessionRow,
  entryRows: readonly EntryRow[],
  setRows: readonly SetRow[],
): session.Session {
  const entries: session.SessionEntry[] = [...entryRows]
    .sort((a, b) => a.position - b.position)
    .map((entry) => ({
      id: entry.id as session.SessionEntryId,
      exerciseId: entry.exerciseId as ExerciseId,
      position: entry.position,
      status: entry.status,
      supersetGroup: opt(entry.supersetGroup),
      note: opt(entry.note),
      sets: setRows
        .filter((s) => s.sessionExerciseId === entry.id)
        .sort((a, b) => a.position - b.position)
        .map(setToDomain),
    }))

  const base = {
    id: row.id as session.SessionId,
    userId: row.userId as UserId,
    type: row.type,
    origin: row.origin,
    routineId: opt(row.routineId) as RoutineId | undefined,
    plannedFor: opt(row.plannedFor),
    note: opt(row.note),
    entries,
  }

  switch (row.status) {
    case 'planned':
      return { ...base, status: 'planned' }
    case 'active':
      return {
        ...base,
        status: 'active',
        startedAt: must(row.startedAt, 'startedAt'),
      }
    case 'completed':
      return {
        ...base,
        status: 'completed',
        startedAt: must(row.startedAt, 'startedAt'),
        completedAt: must(row.completedAt, 'completedAt'),
      }
    case 'abandoned':
      return {
        ...base,
        status: 'abandoned',
        startedAt: must(row.startedAt, 'startedAt'),
        abandonedAt: must(row.abandonedAt, 'abandonedAt'),
      }
  }
}

// ── domain → rows ───────────────────────────────────────────────────────────

export function sessionToRows(s: session.Session): {
  sessionRow: NewSessionRow
  entryRows: NewEntryRow[]
  setRows: NewSetRow[]
} {
  const sessionRow: NewSessionRow = {
    id: s.id,
    userId: s.userId,
    type: s.type,
    status: s.status,
    origin: s.origin,
    routineId: s.routineId ?? null,
    plannedFor: s.plannedFor ?? null,
    startedAt: s.status !== 'planned' ? s.startedAt : null,
    completedAt: s.status === 'completed' ? s.completedAt : null,
    abandonedAt: s.status === 'abandoned' ? s.abandonedAt : null,
    note: s.note ?? null,
  }
  const entryRows: NewEntryRow[] = s.entries.map((e) => ({
    id: e.id,
    sessionId: s.id,
    exerciseId: e.exerciseId,
    position: e.position,
    status: e.status,
    supersetGroup: e.supersetGroup ?? null,
    note: e.note ?? null,
  }))
  const setRows: NewSetRow[] = s.entries.flatMap((e) =>
    e.sets.map((set) => ({
      id: set.id,
      sessionExerciseId: e.id,
      position: set.position,
      setType: set.setType,
      targetWeightKg: set.prescription?.weightKg ?? null,
      targetReps: set.prescription?.reps ?? null,
      targetRpe: set.prescription?.rpe ?? null,
      actualWeightKg: set.performance?.weightKg ?? null,
      actualReps: set.performance?.reps ?? null,
      actualRpe: set.performance?.rpe ?? null,
      completedAt: set.performance?.completedAt ?? null,
      note: set.note ?? null,
    })),
  )
  return { sessionRow, entryRows, setRows }
}
