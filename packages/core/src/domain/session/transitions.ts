import type { DomainError, Result, Transitioned } from '../../kernel'
import { err, newId, ok, transitioned } from '../../kernel'
import type { ExerciseId, RoutineId, UserId } from '../ids'
import type {
  Performance,
  Prescription,
  Reps,
  Rpe,
  SetType,
  WeightKg,
} from '../values'
import type {
  SessionAbandoned,
  SessionCompleted,
  SessionPlanned,
  SessionStarted,
  SetAmended,
  SetLogged,
} from './events'
import {
  sessionAbandoned,
  sessionCompleted,
  sessionPlanned,
  sessionStarted,
  setAmended,
  setLogged,
} from './events'
import type {
  AbandonedSession,
  ActiveSession,
  CompletedSession,
  PlannedSession,
  Session,
  SessionEntry,
  SessionEntryId,
  SessionId,
  SessionOrigin,
  SessionSet,
  SetId,
} from './model'
import { AMEND_WINDOW_MS, endedAt, loggedSetCount } from './model'

// ── plan ────────────────────────────────────────────────────────────────────

export type PlanSetInput = Readonly<{
  setType?: SetType
  prescription?: Prescription
  note?: string
}>

export type PlanEntryInput = Readonly<{
  exerciseId: ExerciseId
  supersetGroup?: number
  note?: string
  sets?: readonly PlanSetInput[]
}>

export type PlanSessionInput = Readonly<{
  userId: UserId
  origin: SessionOrigin
  routineId?: RoutineId
  plannedFor?: Date
  note?: string
  entries?: readonly PlanEntryInput[]
}>

// Empty plans are allowed on purpose: an ad-hoc session is plan() + start()
// with entries created on the fly by logSet.
export function plan(
  input: PlanSessionInput,
  now: Date,
): Transitioned<PlannedSession, SessionPlanned> {
  const entries: readonly SessionEntry[] = (input.entries ?? []).map(
    (entry, i) => ({
      id: newId<SessionEntryId>(),
      exerciseId: entry.exerciseId,
      position: i,
      status: 'planned',
      supersetGroup: entry.supersetGroup,
      note: entry.note,
      sets: (entry.sets ?? []).map(
        (set, j): SessionSet => ({
          id: newId<SetId>(),
          position: j,
          setType: set.setType ?? 'working',
          prescription: set.prescription,
          note: set.note,
        }),
      ),
    }),
  )

  const session: PlannedSession = {
    id: newId<SessionId>(),
    userId: input.userId,
    type: 'strength',
    origin: input.origin,
    routineId: input.routineId,
    plannedFor: input.plannedFor,
    note: input.note,
    entries,
    status: 'planned',
  }

  return transitioned(
    session,
    sessionPlanned(
      {
        sessionId: session.id,
        origin: session.origin,
        entryCount: entries.length,
      },
      now,
    ),
  )
}

// ── lifecycle ───────────────────────────────────────────────────────────────

export function start(
  session: PlannedSession,
  now: Date,
): Transitioned<ActiveSession, SessionStarted> {
  return transitioned(
    { ...session, status: 'active', startedAt: now },
    sessionStarted({ sessionId: session.id }, now),
  )
}

// Completing with zero logged sets is allowed — full user flexibility by design.
export function complete(
  session: ActiveSession,
  now: Date,
): Transitioned<CompletedSession, SessionCompleted> {
  return transitioned(
    { ...session, status: 'completed', completedAt: now },
    sessionCompleted(
      { sessionId: session.id, loggedSetCount: loggedSetCount(session) },
      now,
    ),
  )
}

// Abandoning keeps everything already logged.
export function abandon(
  session: ActiveSession,
  now: Date,
): Transitioned<AbandonedSession, SessionAbandoned> {
  return transitioned(
    { ...session, status: 'abandoned', abandonedAt: now },
    sessionAbandoned(
      { sessionId: session.id, loggedSetCount: loggedSetCount(session) },
      now,
    ),
  )
}

// ── logSet ──────────────────────────────────────────────────────────────────

export type PerformanceInput = Readonly<{
  weightKg?: WeightKg
  reps?: Reps
  rpe?: Rpe
}>

export type LogSetInput = Readonly<{
  exerciseId: ExerciseId
  /** fill the performance of an existing planned set; omit to append ad-hoc */
  setId?: SetId
  setType?: SetType
  performance: PerformanceInput
  note?: string
}>

export type LogSetError =
  | DomainError<'UnknownSet'>
  | DomainError<'SetAlreadyLogged'>

export function logSet(
  session: ActiveSession,
  input: LogSetInput,
  now: Date,
): Result<Transitioned<ActiveSession, SetLogged>, LogSetError> {
  const performance: Performance = { ...input.performance, completedAt: now }

  if (input.setId !== undefined) {
    const found = findSet(session.entries, input.setId)
    if (!found) return err({ type: 'UnknownSet' })
    const [entry, set] = found
    if (set.performance) {
      return err({
        type: 'SetAlreadyLogged',
        message: 'use amendSet to change a logged set',
      })
    }
    const next: ActiveSession = {
      ...session,
      entries: session.entries.map((e) =>
        e.id !== entry.id
          ? e
          : {
              ...e,
              status: 'done',
              sets: e.sets.map((s) =>
                s.id === set.id
                  ? { ...s, performance, note: input.note ?? s.note }
                  : s,
              ),
            },
      ),
    }
    return ok(
      transitioned(
        next,
        setLogged(
          {
            sessionId: session.id,
            entryId: entry.id,
            setId: set.id,
            exerciseId: entry.exerciseId,
            performance,
          },
          now,
        ),
      ),
    )
  }

  // Ad-hoc: append to this exercise's entry, creating the entry if needed.
  const existing = session.entries.find(
    (e) => e.exerciseId === input.exerciseId,
  )
  const entry: SessionEntry = existing ?? {
    id: newId<SessionEntryId>(),
    exerciseId: input.exerciseId,
    position: session.entries.length,
    status: 'planned',
    sets: [],
  }
  const set: SessionSet = {
    id: newId<SetId>(),
    position: entry.sets.length,
    setType: input.setType ?? 'working',
    performance,
    note: input.note,
  }
  const updated: SessionEntry = {
    ...entry,
    status: 'done',
    sets: [...entry.sets, set],
  }
  const next: ActiveSession = {
    ...session,
    entries: existing
      ? session.entries.map((e) => (e.id === entry.id ? updated : e))
      : [...session.entries, updated],
  }
  return ok(
    transitioned(
      next,
      setLogged(
        {
          sessionId: session.id,
          entryId: entry.id,
          setId: set.id,
          exerciseId: entry.exerciseId,
          performance,
        },
        now,
      ),
    ),
  )
}

// ── amendSet ────────────────────────────────────────────────────────────────

export type SetPatch = Readonly<{
  setType?: SetType
  prescription?: Prescription
  performance?: Performance
  note?: string
}>

export type AmendSetError =
  | DomainError<'UnknownSet'>
  | DomainError<'AmendWindowClosed'>

export type AmendableSession =
  | ActiveSession
  | CompletedSession
  | AbandonedSession

// Active sessions amend freely; ended ones only inside the ~24h window
// ("fix typos, adjust anything" — then the record freezes).
export function amendSet<S extends AmendableSession>(
  session: S,
  setId: SetId,
  patch: SetPatch,
  now: Date,
): Result<Transitioned<S, SetAmended>, AmendSetError> {
  if (session.status !== 'active') {
    const closesAt = endedAt(session).getTime() + AMEND_WINDOW_MS
    if (now.getTime() > closesAt) return err({ type: 'AmendWindowClosed' })
  }

  const found = findSet(session.entries, setId)
  if (!found) return err({ type: 'UnknownSet' })
  const [entry] = found

  // cast: spreading a generic S widens to the base type; the runtime shape is S
  const next = {
    ...session,
    entries: session.entries.map((e) =>
      e.id !== entry.id
        ? e
        : {
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
          },
    ),
  } as S

  return ok(
    transitioned(next, setAmended({ sessionId: session.id, setId }, now)),
  )
}

// ── guards: runtime data → compile-time states ──────────────────────────────

export type WrongSessionState = DomainError<
  'WrongSessionState',
  { expected: string; actual: Session['status'] }
>

const wrongState = (
  expected: string,
  actual: Session['status'],
): WrongSessionState => ({
  type: 'WrongSessionState',
  expected,
  actual,
})

export function ensurePlanned(
  session: Session,
): Result<PlannedSession, WrongSessionState> {
  return session.status === 'planned'
    ? ok(session)
    : err(wrongState('planned', session.status))
}

export function ensureActive(
  session: Session,
): Result<ActiveSession, WrongSessionState> {
  return session.status === 'active'
    ? ok(session)
    : err(wrongState('active', session.status))
}

export function ensureAmendable(
  session: Session,
): Result<AmendableSession, WrongSessionState> {
  return session.status === 'planned'
    ? err(wrongState('active|completed|abandoned', session.status))
    : ok(session)
}

// ── internals ───────────────────────────────────────────────────────────────

function findSet(
  entries: readonly SessionEntry[],
  setId: SetId,
): readonly [SessionEntry, SessionSet] | undefined {
  for (const entry of entries) {
    const set = entry.sets.find((s) => s.id === setId)
    if (set) return [entry, set]
  }
  return undefined
}
