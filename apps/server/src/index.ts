import { app, type UserId } from '@gart/core'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { RPCHandler } from '@orpc/server/fastify'
import { fromNodeHeaders } from 'better-auth/node'
import Fastify from 'fastify'
import { makeExerciseCatalog } from './adapters/drizzle/exercise-catalog'
import { makeSessionRepo } from './adapters/drizzle/session-repo'
import { makeUnitOfWork } from './adapters/drizzle/unit-of-work'
import { makeMcpServer } from './api/mcp'
import { makeRouter } from './api/rpc'
import { auth } from './auth'
import { db } from './db'
import { env } from './env'

// One deployable, three faces (see notes/stack.md):
//   /api/auth/*  better-auth (identity for app and MCP clients)
//   /rpc/*       oRPC — the mobile app's API
//   /mcp         MCP Streamable HTTP — the models' API
// All faces share the same use-cases (@gart/core application layer) over the
// same domain + Postgres.

const server = Fastify({ logger: true })

// Composition root: adapters implement the core's ports.
const useCases = app.makeApp({
  uow: makeUnitOfWork(db),
  sessions: makeSessionRepo(db),
  exercises: makeExerciseCatalog(db),
  clock: () => new Date(),
  events: (event) => server.log.info({ domainEvent: event }, event.type),
})

async function currentUserId(request: {
  headers: Record<string, unknown>
}): Promise<UserId | null> {
  const found = await auth.api.getSession({
    headers: fromNodeHeaders(
      request.headers as Parameters<typeof fromNodeHeaders>[0],
    ),
  })
  return (found?.user.id as UserId | undefined) ?? null
}

// ── better-auth ─────────────────────────────────────────────────────────────

server.route({
  method: ['GET', 'POST'],
  url: '/api/auth/*',
  async handler(request, reply) {
    const url = new URL(request.url, env.BETTER_AUTH_URL)
    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value === undefined) continue
      headers.append(
        key,
        Array.isArray(value) ? value.join(', ') : String(value),
      )
    }
    const response = await auth.handler(
      new Request(url, {
        method: request.method,
        headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      }),
    )
    reply.status(response.status)
    response.headers.forEach((value, key) => {
      if (key !== 'set-cookie') reply.header(key, value)
    })
    const cookies = response.headers.getSetCookie()
    if (cookies.length > 0) reply.header('set-cookie', cookies)
    reply.send(response.body ? await response.text() : null)
  },
})

// ── oRPC (app face) ─────────────────────────────────────────────────────────

const rpcHandler = new RPCHandler(makeRouter(useCases))

server.all('/rpc/*', async (request, reply) => {
  const { matched } = await rpcHandler.handle(request, reply, {
    prefix: '/rpc',
    context: { userId: await currentUserId(request) },
  })
  if (!matched) reply.code(404).send({ error: 'not found' })
})

// ── MCP (model face) ────────────────────────────────────────────────────────
// Stateless Streamable HTTP: a fresh server + transport per request, scoped
// to the authenticated user. TODO: OAuth 2.1 discovery + DCR so MCP clients
// can onboard with just the URL; bearer session tokens work today.

server.post('/mcp', async (request, reply) => {
  const userId = await currentUserId(request)
  if (!userId) {
    reply.code(401).send({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'authentication required' },
      id: null,
    })
    return
  }
  const mcp = makeMcpServer(useCases, { userId })
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  reply.raw.on('close', () => {
    void transport.close()
    void mcp.close()
  })
  await mcp.connect(transport)
  reply.hijack()
  await transport.handleRequest(request.raw, reply.raw, request.body)
})

for (const method of ['GET', 'DELETE'] as const) {
  server.route({
    method,
    url: '/mcp',
    handler: (_request, reply) => {
      reply.code(405).send({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'method not allowed' },
        id: null,
      })
    },
  })
}

// ── plain health for Coolify ────────────────────────────────────────────────

server.get('/health', () => ({ status: 'ok' as const }))

server.listen({ port: env.PORT, host: '0.0.0.0' }).catch((err: unknown) => {
  server.log.error(err)
  process.exit(1)
})
