import { z } from 'zod'

// The only platform API the domain touches; declared locally instead of
// pulling in @types/node so the package stays runtime-agnostic.
declare const crypto: { randomUUID(): string }

// Branded uuid schema: brandedId('Session') yields a schema whose output type
// is nominally distinct — a SessionId can't be passed where a SetId is expected.
export function brandedId<B extends string>(_brand: B) {
  return z.uuid().brand<B>()
}

export type IdOf<S extends z.ZodType> = z.output<S>

export function newId<T extends string>(): T {
  return crypto.randomUUID() as T
}
