export type DomainEvent<T extends string = string, P = unknown> = Readonly<{
  type: T
  at: Date
  payload: Readonly<P>
}>

// Typed event constructor factory. The double call lets TS infer the payload
// type parameter while the event name stays a literal:
//   export const setLogged = defineEvent('SetLogged')<SetLoggedPayload>()
export function defineEvent<T extends string>(type: T) {
  return <P>() =>
    (payload: P, at: Date): DomainEvent<T, P> => ({ type, at, payload })
}

// A transition's happy path: the next state plus the event describing it.
export type Transitioned<S, E extends DomainEvent> = readonly [
  state: S,
  event: E,
]

export function transitioned<S, E extends DomainEvent>(
  state: S,
  event: E,
): Transitioned<S, E> {
  return [state, event]
}
