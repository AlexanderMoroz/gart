import type { Result } from './result'

// An application use-case: business logic with injected dependencies.
// Dependencies go in through a factory, actor + input per call, Result out —
// use-cases never throw; the driving adapter (HTTP, MCP, CLI) decides what a
// failure becomes. Example:
//
//   type LogSet = UseCase<Actor, LogSetInput, LogSetOutput, LogSetError>
//   const makeLogSet = (deps: Deps): LogSet => async (actor, input) => { ... }
export type UseCase<TActor, TInput, TOutput, TError = never> = (
  actor: TActor,
  input: TInput,
) => Promise<Result<TOutput, TError>>
