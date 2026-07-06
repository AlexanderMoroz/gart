import { describe, expect, it } from 'vitest'
import type { ExerciseId, UserId } from '../index'
import { newId, Reps, session, WeightKg } from '../index'

const T0 = new Date('2026-07-06T10:00:00.000Z')
const hoursAfter = (h: number) => new Date(T0.getTime() + h * 60 * 60 * 1000)

const userId = newId<UserId>()
const benchId = newId<ExerciseId>()
const squatId = newId<ExerciseId>()

const kg = (n: number) => WeightKg.parse(n)
const reps = (n: number) => Reps.parse(n)

const plannedBench = () =>
  session.plan(
    {
      userId,
      origin: 'mcp',
      entries: [
        {
          exerciseId: benchId,
          sets: [
            { prescription: { weightKg: kg(80), reps: reps(5) } },
            { prescription: { weightKg: kg(80), reps: reps(5) } },
          ],
        },
      ],
    },
    T0,
  )

const activeBench = () => session.start(plannedBench()[0], hoursAfter(1))[0]

function firstSetId(s: session.Session): session.SetId {
  const id = s.entries[0]?.sets[0]?.id
  if (!id) throw new Error('fixture has no sets')
  return id
}

describe('plan', () => {
  it('builds planned entries with generated ids and positions', () => {
    const [planned, event] = plannedBench()
    expect(planned.status).toBe('planned')
    expect(planned.entries).toHaveLength(1)
    expect(planned.entries[0]?.status).toBe('planned')
    expect(planned.entries[0]?.sets.map((s) => s.position)).toEqual([0, 1])
    expect(event.type).toBe('SessionPlanned')
    expect(event.payload).toMatchObject({
      sessionId: planned.id,
      entryCount: 1,
    })
  })

  it('allows an empty plan — the ad-hoc flow', () => {
    const [planned] = session.plan({ userId, origin: 'adhoc' }, T0)
    expect(planned.entries).toHaveLength(0)
  })
})

describe('start', () => {
  it('stamps startedAt and keeps the same identity', () => {
    const [planned] = plannedBench()
    const [active, event] = session.start(planned, hoursAfter(1))
    expect(active.status).toBe('active')
    expect(active.startedAt).toEqual(hoursAfter(1))
    expect(active.id).toBe(planned.id)
    expect(event.type).toBe('SessionStarted')
  })
})

describe('logSet', () => {
  it('fills a prescribed set, keeps the prescription, marks the entry done', () => {
    const active = activeBench()
    const setId = firstSetId(active)
    const [next, event] = session
      .logSet(
        active,
        {
          exerciseId: benchId,
          setId,
          performance: { weightKg: kg(82.5), reps: reps(5) },
        },
        hoursAfter(1.1),
      )
      ._unsafeUnwrap()

    const set = next.entries[0]?.sets[0]
    expect(set?.performance?.weightKg).toBe(kg(82.5))
    expect(set?.performance?.completedAt).toEqual(hoursAfter(1.1))
    expect(set?.prescription?.weightKg).toBe(kg(80))
    expect(next.entries[0]?.status).toBe('done')
    expect(event.type).toBe('SetLogged')
    expect(event.payload.setId).toBe(setId)
  })

  it('rejects double-logging the same set', () => {
    const active = activeBench()
    const setId = firstSetId(active)
    const input = { exerciseId: benchId, setId, performance: { reps: reps(5) } }
    const [once] = session
      .logSet(active, input, hoursAfter(1.1))
      ._unsafeUnwrap()
    const twice = session.logSet(once, input, hoursAfter(1.2))
    expect(twice._unsafeUnwrapErr().type).toBe('SetAlreadyLogged')
  })

  it('rejects an unknown set id', () => {
    const result = session.logSet(
      activeBench(),
      { exerciseId: benchId, setId: newId<session.SetId>(), performance: {} },
      hoursAfter(1.1),
    )
    expect(result._unsafeUnwrapErr().type).toBe('UnknownSet')
  })

  it('ad-hoc: creates an entry for a new exercise and appends sets to it', () => {
    const active = activeBench()
    const [afterFirst] = session
      .logSet(
        active,
        {
          exerciseId: squatId,
          performance: { weightKg: kg(100), reps: reps(3) },
        },
        hoursAfter(1.2),
      )
      ._unsafeUnwrap()
    const [afterSecond] = session
      .logSet(
        afterFirst,
        {
          exerciseId: squatId,
          setType: 'drop',
          performance: { weightKg: kg(80) },
        },
        hoursAfter(1.3),
      )
      ._unsafeUnwrap()

    expect(afterSecond.entries).toHaveLength(2)
    const squat = afterSecond.entries[1]
    expect(squat?.exerciseId).toBe(squatId)
    expect(squat?.status).toBe('done')
    expect(squat?.sets.map((s) => [s.position, s.setType])).toEqual([
      [0, 'working'],
      [1, 'drop'],
    ])
  })
})

describe('complete / abandon', () => {
  it('complete stamps completedAt and counts logged sets', () => {
    const active = activeBench()
    const [logged] = session
      .logSet(
        active,
        {
          exerciseId: benchId,
          setId: firstSetId(active),
          performance: { reps: reps(5) },
        },
        hoursAfter(1.1),
      )
      ._unsafeUnwrap()
    const [completed, event] = session.complete(logged, hoursAfter(2))
    expect(completed.status).toBe('completed')
    expect(completed.completedAt).toEqual(hoursAfter(2))
    expect(event.payload.loggedSetCount).toBe(1)
  })

  it('completing with nothing logged is allowed — user freedom by design', () => {
    const [completed, event] = session.complete(activeBench(), hoursAfter(2))
    expect(completed.status).toBe('completed')
    expect(event.payload.loggedSetCount).toBe(0)
  })

  it('abandon keeps the logged actuals', () => {
    const active = activeBench()
    const [logged] = session
      .logSet(
        active,
        {
          exerciseId: benchId,
          setId: firstSetId(active),
          performance: { reps: reps(4) },
        },
        hoursAfter(1.1),
      )
      ._unsafeUnwrap()
    const [abandoned, event] = session.abandon(logged, hoursAfter(1.5))
    expect(abandoned.status).toBe('abandoned')
    expect(abandoned.entries[0]?.sets[0]?.performance?.reps).toBe(reps(4))
    expect(event.payload.loggedSetCount).toBe(1)
  })
})

describe('amendSet', () => {
  const completedWithLog = () => {
    const active = activeBench()
    const [logged] = session
      .logSet(
        active,
        {
          exerciseId: benchId,
          setId: firstSetId(active),
          performance: { reps: reps(5) },
        },
        hoursAfter(1.1),
      )
      ._unsafeUnwrap()
    return session.complete(logged, hoursAfter(2))[0]
  }

  it('amends freely while active', () => {
    const active = activeBench()
    const setId = firstSetId(active)
    const [next, event] = session
      .amendSet(
        active,
        setId,
        { note: 'left shoulder clicked' },
        hoursAfter(1.2),
      )
      ._unsafeUnwrap()
    expect(next.status).toBe('active')
    expect(next.entries[0]?.sets[0]?.note).toBe('left shoulder clicked')
    expect(event.type).toBe('SetAmended')
  })

  it('amends an ended session inside the 24h window', () => {
    const completed = completedWithLog()
    const [next] = session
      .amendSet(
        completed,
        firstSetId(completed),
        { performance: { reps: reps(6), completedAt: hoursAfter(1.1) } },
        hoursAfter(2 + 23),
      )
      ._unsafeUnwrap()
    expect(next.status).toBe('completed')
    expect(next.entries[0]?.sets[0]?.performance?.reps).toBe(reps(6))
  })

  it('freezes the record after the window', () => {
    const completed = completedWithLog()
    const result = session.amendSet(
      completed,
      firstSetId(completed),
      { note: 'too late' },
      hoursAfter(2 + 25),
    )
    expect(result._unsafeUnwrapErr().type).toBe('AmendWindowClosed')
  })

  it('rejects an unknown set id', () => {
    const result = session.amendSet(
      activeBench(),
      newId<session.SetId>(),
      { note: 'nope' },
      hoursAfter(1.2),
    )
    expect(result._unsafeUnwrapErr().type).toBe('UnknownSet')
  })
})

describe('guards', () => {
  it('narrow runtime data to compile-time states', () => {
    const [planned] = plannedBench()
    const stored: session.Session = planned

    expect(session.ensurePlanned(stored).isOk()).toBe(true)
    expect(session.ensureActive(stored)._unsafeUnwrapErr()).toMatchObject({
      type: 'WrongSessionState',
      expected: 'active',
      actual: 'planned',
    })
    expect(session.ensureAmendable(stored).isErr()).toBe(true)
  })
})

describe('type-level: illegal transitions do not compile', () => {
  it('rejects operations on wrong states at compile time', () => {
    const [active] = session.start(plannedBench()[0], T0)
    const [completed] = session.complete(active, hoursAfter(2))

    const _noLogOnCompleted = () =>
      // @ts-expect-error — logSet only accepts an ActiveSession
      session.logSet(completed, { exerciseId: benchId, performance: {} }, T0)
    const _noDoubleStart = () =>
      // @ts-expect-error — start only accepts a PlannedSession
      session.start(active, T0)
    const _noAmendOnPlanned = () =>
      // @ts-expect-error — amendSet rejects planned sessions
      session.amendSet(plannedBench()[0], newId<session.SetId>(), {}, T0)

    expect([_noLogOnCompleted, _noDoubleStart, _noAmendOnPlanned]).toHaveLength(
      3,
    )
  })
})
