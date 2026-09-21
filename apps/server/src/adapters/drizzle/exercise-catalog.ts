import type { app, ExerciseId, UserId } from '@gart/core'
import { exercises, movements } from '@gart/db'
import { and, arrayContains, asc, eq, ilike, inArray, or } from 'drizzle-orm'

import type { DbLike } from '../../db'

const visibleTo = (viewer: UserId) =>
  and(
    eq(exercises.isArchived, false),
    or(eq(exercises.scope, 'global'), eq(exercises.ownerId, viewer)),
  )

export function makeExerciseCatalog(dbx: DbLike): app.ExerciseCatalog {
  return {
    async list(viewer, input) {
      const rows = await dbx
        .select({ exercise: exercises, movement: movements })
        .from(exercises)
        .innerJoin(movements, eq(exercises.movementId, movements.id))
        .where(
          and(
            visibleTo(viewer),
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

    async findByIds(ids) {
      const rows = await dbx
        .select({
          id: exercises.id,
          scope: exercises.scope,
          ownerId: exercises.ownerId,
          isArchived: exercises.isArchived,
        })
        .from(exercises)
        .where(inArray(exercises.id, [...ids]))
      return rows.map((row) => ({
        id: row.id as ExerciseId,
        scope: row.scope,
        ownerId: (row.ownerId ?? undefined) as UserId | undefined,
        isArchived: row.isArchived,
      }))
    },
  }
}
