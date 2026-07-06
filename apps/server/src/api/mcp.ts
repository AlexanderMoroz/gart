import {
  CreateSessionInput,
  GetRecentSessionsInput,
  ListExercisesInput,
  LogSetInput,
  SessionRefInput,
} from '@gart/contract'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Actor, UseCases } from '../use-cases'

const json = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
})

// The model face: few meaty tools, thin mappings over the same use-cases as
// oRPC. Input schemas are the contract's — one source of truth.
// Scoped per request: every tool call acts as the authenticated user.
export function makeMcpServer(uc: UseCases, actor: Actor) {
  const server = new McpServer({ name: 'gart', version: '0.1.0' })

  server.registerTool(
    'list_exercises',
    {
      title: 'List exercises',
      description:
        'Search the exercise catalog (movement × equipment). Filter by free-text query, muscle group, or equipment.',
      inputSchema: ListExercisesInput.shape,
    },
    async (input) => json(await uc.exercises.list(actor, input)),
  )

  server.registerTool(
    'get_recent_sessions',
    {
      title: 'Get recent sessions',
      description:
        "The user's training sessions, newest first. Filter by status: planned (upcoming), active, completed, abandoned.",
      inputSchema: GetRecentSessionsInput.shape,
    },
    async (input) => json(await uc.sessions.listRecent(actor, input)),
  )

  server.registerTool(
    'create_session',
    {
      title: 'Plan a training session',
      description:
        "Create a planned session that appears in the user's upcoming list. Provide entries (exercises with prescribed sets: weight in kg, reps, optional RPE). Weights are ALWAYS kilograms.",
      inputSchema: CreateSessionInput.shape,
    },
    async (input) => json(await uc.sessions.create(actor, input, 'mcp')),
  )

  server.registerTool(
    'start_session',
    {
      title: 'Start a planned session',
      description:
        'Transition a planned session to active so sets can be logged.',
      inputSchema: SessionRefInput.shape,
    },
    async ({ sessionId }) => json(await uc.sessions.start(actor, sessionId)),
  )

  server.registerTool(
    'log_set',
    {
      title: 'Log a set',
      description:
        'Record a performed set in the active session. Pass setId to fill a prescribed set, or omit it to append an ad-hoc set for the exercise. Weight in kg.',
      inputSchema: LogSetInput.shape,
    },
    async (input) => json(await uc.sessions.logSet(actor, input)),
  )

  server.registerTool(
    'complete_session',
    {
      title: 'Complete the active session',
      description:
        'Finish the active session and freeze the record (24h amend window).',
      inputSchema: SessionRefInput.shape,
    },
    async ({ sessionId }) => json(await uc.sessions.complete(actor, sessionId)),
  )

  return server
}
