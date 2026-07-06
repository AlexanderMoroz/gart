// Pure domain layer — functional kernel (fs-ddd style), zero IO dependencies.
// Aggregate boundary = module boundary: `import { session } from '@gart/domain'`
// and call lowercase transitions (session.start, session.logSet, ...).

export * from './ids'
export * from './kernel'
export * as session from './session'
export * from './values'
