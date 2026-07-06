import {
  Equipment,
  ExerciseId,
  MuscleGroup,
  Performance,
  Prescription,
  Reps,
  RoutineId,
  Rpe,
  SetType,
  session,
  WeightKg,
} from '@gart/domain'
import { z } from 'zod'

// Wire DTOs and inputs. Value objects and enum lists come from @gart/domain —
// one source of truth for app client, MCP tool schemas, and OpenAPI docs.
// userId never appears on the wire: it comes from the auth context.

// ── catalog ─────────────────────────────────────────────────────────────────

export const MovementDto = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  primaryMuscles: z.array(MuscleGroup),
  secondaryMuscles: z.array(MuscleGroup),
})
export type MovementDto = z.output<typeof MovementDto>

export const ExerciseDto = z.object({
  id: ExerciseId,
  name: z.string(),
  equipment: Equipment,
  variation: z.string().optional(),
  movement: MovementDto,
})
export type ExerciseDto = z.output<typeof ExerciseDto>

export const ListExercisesInput = z.object({
  query: z.string().min(1).max(100).optional(),
  muscleGroup: MuscleGroup.optional(),
  equipment: Equipment.optional(),
  limit: z.int().min(1).max(200).default(100),
})
export type ListExercisesInput = z.output<typeof ListExercisesInput>

// ── sessions ────────────────────────────────────────────────────────────────

export const SetDto = z.object({
  id: session.SetId,
  position: z.int(),
  setType: SetType,
  prescription: Prescription.optional(),
  performance: Performance.optional(),
  note: z.string().optional(),
})
export type SetDto = z.output<typeof SetDto>

export const SessionEntryDto = z.object({
  id: session.SessionEntryId,
  exerciseId: ExerciseId,
  position: z.int(),
  status: z.enum(session.ENTRY_STATUSES),
  supersetGroup: z.int().optional(),
  note: z.string().optional(),
  sets: z.array(SetDto),
})
export type SessionEntryDto = z.output<typeof SessionEntryDto>

export const SessionDto = z.object({
  id: session.SessionId,
  type: z.enum(session.SESSION_TYPES),
  status: z.enum(session.SESSION_STATUSES),
  origin: z.enum(session.SESSION_ORIGINS),
  routineId: RoutineId.optional(),
  plannedFor: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  abandonedAt: z.date().optional(),
  note: z.string().optional(),
  entries: z.array(SessionEntryDto),
})
export type SessionDto = z.output<typeof SessionDto>

export const GetRecentSessionsInput = z.object({
  status: z.enum(session.SESSION_STATUSES).optional(),
  limit: z.int().min(1).max(100).default(20),
})
export type GetRecentSessionsInput = z.output<typeof GetRecentSessionsInput>

const note = z.string().max(2000).optional()

// origin is NOT client-supplied — the server face (app vs MCP) decides it.
export const CreateSessionInput = z.object({
  routineId: RoutineId.optional(),
  plannedFor: z.date().optional(),
  note,
  entries: z
    .array(
      z.object({
        exerciseId: ExerciseId,
        supersetGroup: z.int().positive().optional(),
        note,
        sets: z
          .array(
            z.object({
              setType: SetType.optional(),
              prescription: Prescription.optional(),
              note,
            }),
          )
          .default([]),
      }),
    )
    .default([]),
})
export type CreateSessionInput = z.output<typeof CreateSessionInput>

export const SessionRefInput = z.object({ sessionId: session.SessionId })
export type SessionRefInput = z.output<typeof SessionRefInput>

export const LogSetInput = z.object({
  sessionId: session.SessionId,
  exerciseId: ExerciseId,
  /** fill an existing planned set; omit to append ad-hoc */
  setId: session.SetId.optional(),
  setType: SetType.optional(),
  performance: z.object({
    weightKg: WeightKg.optional(),
    reps: Reps.optional(),
    rpe: Rpe.optional(),
  }),
  note,
})
export type LogSetInput = z.output<typeof LogSetInput>

export const LogSetOutput = z.object({
  session: SessionDto,
  setId: session.SetId,
})
export type LogSetOutput = z.output<typeof LogSetOutput>
