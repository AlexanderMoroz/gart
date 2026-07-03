import Fastify from 'fastify'

// One deployable, three faces (see ../notes/stack.md):
//   1. oRPC routes for the mobile app — implement `contract` from @gart/contract
//   2. MCP endpoint (mcp.gart.fit/mcp) — @modelcontextprotocol/sdk, Streamable HTTP
//   3. better-auth identity (/api/auth/*) — OAuth 2.1 provider for MCP clients
// All three mount here after the data-modeling session defines the real contract.

const app = Fastify({ logger: true })

app.get('/health', () => ({ status: 'ok' as const }))

const port = Number(process.env.PORT ?? 3000)

app.listen({ port, host: '0.0.0.0' }).catch((err: unknown) => {
  app.log.error(err)
  process.exit(1)
})
