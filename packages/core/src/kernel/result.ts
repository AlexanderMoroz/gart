import { err, ok, type Result } from 'neverthrow'
import type { z } from 'zod'

// Single import point for the Result machinery: domain code imports from the
// kernel, never from neverthrow directly, so the lib stays swappable.
export { err, ok, Result, ResultAsync } from 'neverthrow'

export type ValidationError = Readonly<{
  type: 'ValidationError'
  issues: readonly Readonly<{ path: string; message: string }>[]
}>

// Parse-don't-validate bridge: Zod schema in, Result out, nothing thrown.
export function parse<S extends z.ZodType>(
  schema: S,
  value: unknown,
): Result<z.output<S>, ValidationError> {
  const parsed = schema.safeParse(value)
  if (parsed.success) return ok(parsed.data)
  return err({
    type: 'ValidationError',
    issues: parsed.error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    })),
  })
}
