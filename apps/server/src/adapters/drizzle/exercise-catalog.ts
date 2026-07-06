import type { app, ExerciseId } from '@gart/core'
import { exercises, movements } from '@gart/db'
import { and, arrayContains, asc, eq, ilike, isNull, or } from 'drizzle-orm'

import type { DbLike } from '../../db'

export function makeExerciseCatalog(dbx: DbLike): app.ExerciseCatalog {
  return {
    async list(userId, input) {
      const rows = await dbx
        .select({ exercise: exercises, movement: movements })
        .from(exercises)
        .innerJoin(movements, eq(exercises.movementId, movements.id))
        .where(
          and(
            eq(exercises.isArchived, false),
            or(isNull(exercises.ownerId), eq(exercises.ownerId, userId)),
            input.equipment
              ? eq(exercises.equipment, input.equipment)
              : undefined,
            input.muscleGroup
              ? arrayContains(movements.primaryMuscles, [input.muscleGroup])
              : undefined,
            input.query ? ilike(exercises.name, `%${input.query}%`) : undefined,
          ),
        )
        .orderBy(asc(exercises.name))
        .limit(input.limit)

      return rows.map(({ exercise, movement }) => ({
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
      }))
    },
  }
}
