import { z } from 'zod'

// Training value objects. Schemas double as smart constructors: parse at the
// boundary (via kernel `parse`), carry branded types inside. Canonical weight
// unit is ALWAYS kg (see notes/data-model.md §3 User).

export const WeightKg = z.number().positive().max(2000).brand<'WeightKg'>()
export type WeightKg = z.output<typeof WeightKg>

export const Reps = z.int().positive().max(1000).brand<'Reps'>()
export type Reps = z.output<typeof Reps>

export const Rpe = z.number().min(1).max(10).multipleOf(0.5).brand<'Rpe'>()
export type Rpe = z.output<typeof Rpe>

export const SetType = z.enum(['warmup', 'working', 'drop', 'failure'])
export type SetType = z.output<typeof SetType>

// What was planned. All fields optional by design — "people are free to mess
// things up"; the contract layer may tighten per use-case.
export const Prescription = z
  .object({
    weightKg: WeightKg.optional(),
    reps: Reps.optional(),
    rpe: Rpe.optional(),
  })
  .readonly()
export type Prescription = z.output<typeof Prescription>

// What actually happened.
export const Performance = z
  .object({
    weightKg: WeightKg.optional(),
    reps: Reps.optional(),
    rpe: Rpe.optional(),
    completedAt: z.date(),
  })
  .readonly()
export type Performance = z.output<typeof Performance>
