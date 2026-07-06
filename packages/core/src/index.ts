// The functional core (fs-ddd style), zero IO dependencies:
//   kernel/       Result, branded ids, events, DomainError, UseCase
//   domain/       aggregates and value objects — `session.start(...)` etc.
//   application/  ports, commands, use-cases — `app.makeApp(deps)`
// Deployables provide adapters for the ports and faces over the use-cases.

export * as app from './application'
export * from './domain/ids'
export * as session from './domain/session'
export * from './domain/values'
export * from './kernel'
