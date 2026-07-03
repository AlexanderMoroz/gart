import { oc } from '@orpc/contract'
import { z } from 'zod'

// Source of truth for every API surface: oRPC routers (mobile app), MCP tool
// schemas, and OpenAPI docs all derive from this contract.
//
// Real resources (exercises, sessions, sets, programs) land after the
// data-modeling session — only a health probe until then.

export const contract = {
  health: oc.output(
    z.object({
      status: z.literal('ok'),
    }),
  ),
}

export type Contract = typeof contract
