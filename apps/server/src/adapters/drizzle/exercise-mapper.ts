import type { app, ExerciseId, UserId } from '@gart/core'
import type { exercises, movements } from '@gart/db'

export type ExerciseRow = typeof exercises.$inferSelect
export type MovementRow = typeof movements.$inferSelect

export function toListItem(
  exercise: ExerciseRow,
  movement: MovementRow,
): app.ExerciseListItem {
  return {
    id: exercise.id as ExerciseId,
    name: exercise.name,
    equipment: exercise.equipment,
    variation: exercise.variation ?? undefined,
    movement: {
      id: movement.id,
      slug: movement.slug,
      name: movement.name,
      primaryMuscles: movement.primaryMuscles,
      secondaryMuscles: movement.secondaryMuscles,
    },
  }
}

export function toAccess(
  exercise: Pick<ExerciseRow, 'id' | 'scope' | 'ownerId' | 'isArchived'>,
): app.ExerciseAccess {
  return {
    id: exercise.id as ExerciseId,
    scope: exercise.scope,
    ownerId: (exercise.ownerId ?? undefined) as UserId | undefined,
    isArchived: exercise.isArchived,
  }
}
