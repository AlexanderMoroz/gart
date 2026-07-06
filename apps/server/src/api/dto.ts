import type { SessionDto } from '@gart/contract'
import type { session } from '@gart/domain'

// domain → wire. Faces own this mapping; use-cases return domain state.
export function sessionToDto(s: session.Session): SessionDto {
  return {
    id: s.id,
    type: s.type,
    status: s.status,
    origin: s.origin,
    routineId: s.routineId,
    plannedFor: s.plannedFor,
    startedAt: s.status !== 'planned' ? s.startedAt : undefined,
    completedAt: s.status === 'completed' ? s.completedAt : undefined,
    abandonedAt: s.status === 'abandoned' ? s.abandonedAt : undefined,
    note: s.note,
    entries: s.entries.map((e) => ({
      id: e.id,
      exerciseId: e.exerciseId,
      position: e.position,
      status: e.status,
      supersetGroup: e.supersetGroup,
      note: e.note,
      sets: e.sets.map((set) => ({
        id: set.id,
        position: set.position,
        setType: set.setType,
        prescription: set.prescription,
        performance: set.performance,
        note: set.note,
      })),
    })),
  }
}
