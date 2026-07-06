import type { DomainError } from '@gart/domain'
import { ORPCError } from '@orpc/server'

// Use-cases return tagged errors; only the faces decide what a failure
// becomes on the wire. This is the oRPC mapping.
export function raise(error: DomainError): never {
  switch (error.type) {
    case 'SessionNotFound':
    case 'UnknownSet':
      throw new ORPCError('NOT_FOUND', { message: error.message ?? error.type })
    case 'SetAlreadyLogged':
    case 'AmendWindowClosed':
    case 'WrongSessionState':
      throw new ORPCError('CONFLICT', {
        message: error.message ?? error.type,
        data: error,
      })
    default:
      throw new ORPCError('BAD_REQUEST', {
        message: error.message ?? error.type,
        data: error,
      })
  }
}
