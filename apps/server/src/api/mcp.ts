import {
  CreateSessionInput,
  GetRecentSessionsInput,
  ListExercisesInput,
  LogSetInput,
  SessionRefInput,
} from '@gart/contract'
import type { DomainError } from '@gart/domain'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Actor, App } from '../app'
import { sessionToDto } from './dto'

const json = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
})

// Use-case failures become tool errors the model can read and react to.
const fail = (error: DomainError) => ({
  isError: true as const,
  content: [
    {
      type: 'text' as const,
      text: `${error.type}${error.message ? `: ${error.message}` : ''}`,
    },
  ],
})

// The model face: few meaty tools, thin mappings over the same use-cases as
// oRPC. Input schemas are the contract's — one source of truth.
// Scoped per request: every tool call acts as the authenticated user.
export function makeMcpServer(app: App, actor: Actor) {
  const server = new McpServer({ name: 'gart', version: '0.1.0' })

  server.registerTool(
    'list_exercises',
    {
      title: 'List exercises',
      description:
        'Search the exercise catalog (movement × equipment). Filter by free-text query, muscle group, or equipment.',
      inputSchema: ListExercisesInput.shape,
    },
    async (input) => (await app.exercises.list(actor, input)).match(json, fail),
  )

  server.registerTool(
    'get_recent_sessions',
    {
      title: 'Get recent sessions',
      description:
        "The user's training sessions, newest first. Filter by status: planned (upcoming), active, completed, abandoned.",
      inputSchema: GetRecentSessionsInput.shape,
    },
    async (input) =>
      (await app.sessions.listRecent(actor, input)).match(
        (found) => json(found.map(sessionToDto)),
        fail,
      ),
  )

  server.registerTool(
    'create_session',
    {
      title: 'Plan a training session',
      description:
        "Create a planned session that appears in the user's upcoming list. Provide entries (exercises with prescribed sets: weight in kg, reps, optional RPE). Weights are ALWAYS kilograms.",
      inputSchema: CreateSessionInput.shape,
    },
    async (input) =>
      (await app.sessions.create(actor, { input, origin: 'mcp' })).match(
        (s) => json(sessionToDto(s)),
        fail,
      ),
  )

  server.registerTool(
    'start_session',
    {
      title: 'Start a planned session',
      description:
        'Transition a planned session to active so sets can be logged.',
      inputSchema: SessionRefInput.shape,
    },
    async (input) =>
      (await app.sessions.start(actor, input)).match(
        (s) => json(sessionToDto(s)),
        fail,
      ),
  )

  server.registerTool(
    'log_set',
    {
      title: 'Log a set',
      description:
        'Record a performed set in the active session. Pass setId to fill a prescribed set, or omit it to append an ad-hoc set for the exercise. Weight in kg.',
      inputSchema: LogSetInput.shape,
    },
    async (input) =>
      (await app.sessions.logSet(actor, input)).match(
        ({ session, setId }) => json({ session: sessionToDto(session), setId }),
        fail,
      ),
  )

  server.registerTool(
    'complete_session',
    {
      title: 'Complete the active session',
      description:
        'Finish the active session and freeze the record (24h amend window).',
      inputSchema: SessionRefInput.shape,
    },
    async (input) =>
      (await app.sessions.complete(actor, input)).match(
        (s) => json(sessionToDto(s)),
        fail,
      ),
  )

  return server
}
