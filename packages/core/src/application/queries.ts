import type { ExerciseId, UserId } from '../domain/ids'
import type * as session from '../domain/session'
import type { Equipment, ExerciseScope, MuscleGroup } from '../domain/values'

// Application-owned query and read-model types. The contract's Zod schemas
// parse the wire INTO these shapes (checked by the compiler at the face call
// sites) — the core never imports the contract.

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

export type ExerciseAccess = Readonly<{
  id: ExerciseId
  scope: ExerciseScope
  ownerId?: UserId
  isArchived: boolean
}>

export type RecentSessionsQuery = Readonly<{
  status?: session.SessionStatus
  limit: number
}>
