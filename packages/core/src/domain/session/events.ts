import { defineEvent } from '../../kernel'
import type { ExerciseId } from '../ids'
import type { Performance } from '../values'
import type { SessionEntryId, SessionId, SessionOrigin, SetId } from './model'

export const sessionPlanned = defineEvent('SessionPlanned')<{
  sessionId: SessionId
  origin: SessionOrigin
  entryCount: number
}>()
export type SessionPlanned = ReturnType<typeof sessionPlanned>

export const sessionStarted = defineEvent('SessionStarted')<{
  sessionId: SessionId
}>()
export type SessionStarted = ReturnType<typeof sessionStarted>

export const setLogged = defineEvent('SetLogged')<{
  sessionId: SessionId
  entryId: SessionEntryId
  setId: SetId
  exerciseId: ExerciseId
  performance: Performance
}>()
export type SetLogged = ReturnType<typeof setLogged>

export const setAmended = defineEvent('SetAmended')<{
  sessionId: SessionId
  setId: SetId
}>()
export type SetAmended = ReturnType<typeof setAmended>

export const sessionCompleted = defineEvent('SessionCompleted')<{
  sessionId: SessionId
  loggedSetCount: number
}>()
export type SessionCompleted = ReturnType<typeof sessionCompleted>

export const sessionAbandoned = defineEvent('SessionAbandoned')<{
  sessionId: SessionId
  loggedSetCount: number
}>()
export type SessionAbandoned = ReturnType<typeof sessionAbandoned>

export type SessionEvent =
  | SessionPlanned
  | SessionStarted
  | SetLogged
  | SetAmended
  | SessionCompleted
  | SessionAbandoned
