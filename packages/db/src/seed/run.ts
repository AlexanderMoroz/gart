import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '../index'
import { exercises, movements } from '../schema/index'
import { EXERCISES, MOVEMENTS } from './data'

// Idempotent catalog seed: movements upsert by slug, exercises insert-if-
// missing by (name, equipment, global). Instructions come from
// free-exercise-db (public domain). Usage:
//   DATABASE_URL=postgres://... pnpm --filter @gart/db db:seed

const DATASET_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

type DatasetExercise = Readonly<{
  id: string
  name: string
  instructions: string[]
}>

async function loadDataset(): Promise<Map<string, DatasetExercise>> {
  const response = await fetch(DATASET_URL)
  if (!response.ok) throw new Error(`dataset fetch failed: ${response.status}`)
  const entries = (await response.json()) as DatasetExercise[]
  return new Map(entries.map((e) => [e.id, e]))
}

async function main() {
  const db = createDb(
    process.env.DATABASE_URL ?? 'postgres://gart:gart@localhost:5432/gart',
  )
  const dataset = await loadDataset()

  const missing = EXERCISES.filter(
    (e) => e.datasetId && !dataset.has(e.datasetId),
  )
  if (missing.length > 0) {
    throw new Error(
      `unknown dataset ids: ${missing.map((e) => e.datasetId).join(', ')}`,
    )
  }

  let inserted = 0
  let skipped = 0

  await db.transaction(async (tx) => {
    const slugToId = new Map<string, string>()
    for (const m of MOVEMENTS) {
      const values = {
        slug: m.slug,
        name: m.name,
        primaryMuscles: [...m.primary],
        secondaryMuscles: [...(m.secondary ?? [])],
      }
      const rows = await tx
        .insert(movements)
        .values(values)
        .onConflictDoUpdate({ target: movements.slug, set: values })
        .returning({ id: movements.id })
      const row = rows[0]
      if (!row) throw new Error(`movement upsert returned nothing: ${m.slug}`)
      slugToId.set(m.slug, row.id)
    }

    for (const e of EXERCISES) {
      const movementId = slugToId.get(e.movement)
      if (!movementId)
        throw new Error(
          `exercise "${e.name}" references unknown movement "${e.movement}"`,
        )

      const existing = await tx
        .select({ id: exercises.id })
        .from(exercises)
        .where(
          and(
            eq(exercises.name, e.name),
            eq(exercises.equipment, e.equipment),
            isNull(exercises.ownerId),
          ),
        )
        .limit(1)
      if (existing.length > 0) {
        skipped += 1
        continue
      }

      const source = e.datasetId ? dataset.get(e.datasetId) : undefined
      await tx.insert(exercises).values({
        movementId,
        equipment: e.equipment,
        name: e.name,
        variation: e.variation,
        instructions: source?.instructions.join('\n'),
      })
      inserted += 1
    }
  })

  console.log(
    `seeded: ${MOVEMENTS.length} movements upserted, ${inserted} exercises inserted, ${skipped} already present`,
  )
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
