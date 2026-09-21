import type * as session from '../domain/session'

// Application-owned command types. The contract's Zod schemas parse the wire
// INTO these shapes (checked by the compiler at the face call sites) — the
// core never imports the contract.

// origin included: the serving face decides it, never the client.
export type CreateSessionCommand = Omit<session.PlanSessionInput, 'userId'>

export type SessionRef = Readonly<{ sessionId: session.SessionId }>

export type LogSetCommand = Readonly<{ sessionId: session.SessionId }> &
  session.LogSetInput
