import type { DomainError } from '@gart/domain'
import { ORPCError } from '@orpc/server'

// Domain errors are tagged values; the HTTP boundary turns them into
// ORPCError codes here and nowhere else.
export function throwDomainError(error: DomainError): never {
  switch (error.type) {
    case 'UnknownSet':
      throw new ORPCError('NOT_FOUND', {
        message: error.message ?? 'set not found',
      })
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

export function notFound(what: string): never {
  throw new ORPCError('NOT_FOUND', { message: `${what} not found` })
}

export function unauthorized(): never {
  throw new ORPCError('UNAUTHORIZED', { message: 'authentication required' })
}
