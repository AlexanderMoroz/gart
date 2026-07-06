import type { ExerciseId, RoutineId, UserId } from '../ids'
import { brandedId, type IdOf } from '../kernel'
import type { Performance, Prescription, SetType } from '../values'

export const SessionId = brandedId('SessionId')
export type SessionId = IdOf<typeof SessionId>

export const SessionEntryId = brandedId('SessionEntryId')
export type SessionEntryId = IdOf<typeof SessionEntryId>

export const SetId = brandedId('SetId')
export type SetId = IdOf<typeof SetId>

export const SESSION_TYPES = ['strength'] as const
export type SessionType = (typeof SESSION_TYPES)[number]

export const SESSION_STATUSES = [
  'planned',
  'active',
  'completed',
  'abandoned',
] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const SESSION_ORIGINS = ['mcp', 'routine', 'adhoc'] as const
export type SessionOrigin = (typeof SESSION_ORIGINS)[number]

export const ENTRY_STATUSES = ['planned', 'done', 'skipped'] as const
export type EntryStatus = (typeof ENTRY_STATUSES)[number]

// A set carries plan and/or fact at value level (data-model.md §3):
// ad-hoc → performance only · planned-not-done → prescription only · done → both.
export type SessionSet = Readonly<{
  id: SetId
  position: number
  setType: SetType
  prescription?: Prescription
  performance?: Performance
  note?: string
}>

export type SessionEntry = Readonly<{
  id: SessionEntryId
  exerciseId: ExerciseId
  position: number
  status: EntryStatus
  supersetGroup?: number
  note?: string
  sets: readonly SessionSet[]
}>

type SessionBase = Readonly<{
  id: SessionId
  userId: UserId
  type: SessionType
  origin: SessionOrigin
  routineId?: RoutineId
  plannedFor?: Date
  note?: string
  entries: readonly SessionEntry[]
}>

// The state pattern: one identity through the whole lifecycle, one table
// underneath, but distinct compile-time states — illegal transitions don't
// typecheck.
export type PlannedSession = SessionBase & Readonly<{ status: 'planned' }>
export type ActiveSession = SessionBase &
  Readonly<{ status: 'active'; startedAt: Date }>
export type CompletedSession = SessionBase &
  Readonly<{ status: 'completed'; startedAt: Date; completedAt: Date }>
export type AbandonedSession = SessionBase &
  Readonly<{ status: 'abandoned'; startedAt: Date; abandonedAt: Date }>

export type EndedSession = CompletedSession | AbandonedSession
export type Session = PlannedSession | ActiveSession | EndedSession

// Ended sessions stay amendable for a grace period, then freeze.
export const AMEND_WINDOW_MS = 24 * 60 * 60 * 1000

export function endedAt(session: EndedSession): Date {
  return session.status === 'completed'
    ? session.completedAt
    : session.abandonedAt
}

export function loggedSetCount(session: Session): number {
  return session.entries
    .flatMap((e) => e.sets)
    .filter((s) => s.performance !== undefined).length
}
