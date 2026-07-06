import type { ExerciseId } from '../domain/ids'
import type * as session from '../domain/session'
import type { Equipment, MuscleGroup } from '../domain/values'

// Application-owned command/query/read-model types. The contract's Zod
// schemas parse the wire INTO these shapes (checked by the compiler at the
// face call sites) — the core never imports the contract.

export type ExerciseFilter = Readonly<{
  query?: string
  muscleGroup?: MuscleGroup
  equipment?: Equipment
  limit: number
}>

// Read model over the catalog — no aggregate behind it.
export type ExerciseListItem = {
  id: ExerciseId
  name: string
  equipment: Equipment
  variation?: string
  movement: {
    id: string
    slug: string
    name: string
    primaryMuscles: MuscleGroup[]
    secondaryMuscles: MuscleGroup[]
  }
}

export type RecentSessionsQuery = Readonly<{
  status?: session.SessionStatus
  limit: number
}>

// origin included: the serving face decides it, never the client.
export type CreateSessionCommand = Omit<session.PlanSessionInput, 'userId'>

export type SessionRef = Readonly<{ sessionId: string }>

export type LogSetCommand = Readonly<{ sessionId: string }> &
  session.LogSetInput
