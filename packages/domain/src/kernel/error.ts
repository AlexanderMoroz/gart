// Tagged domain errors: matched by `type`, never thrown, never instanceof.
export type DomainError<T extends string = string, X = object> = Readonly<
  { type: T; message?: string } & X
>
