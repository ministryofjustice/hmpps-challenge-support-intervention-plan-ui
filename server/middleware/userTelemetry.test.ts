import type { Request } from 'express'
import type { HmppsUser } from '../interfaces/hmppsUser'
import userTelemetry from './userTelemetry'

// the telemetry library sets attributes on the active OpenTelemetry span; it brings @opentelemetry/api as a peer dependency
const { trace } = jest.requireActual<typeof import('@opentelemetry/api')>('@opentelemetry/api')

describe('userTelemetry', () => {
  const setAttribute = jest.fn()
  const next = jest.fn()

  const user = {
    authSource: 'nomis',
    username: 'USER1',
    userId: '231232',
    userUuid: '11111111-1111-1111-1111-111111111111',
    name: 'John Smith',
    displayName: 'John Smith',
    userRoles: [],
    token: 'token',
    staffId: 231232,
    caseLoads: [],
    activeCaseLoad: { caseLoadId: 'MDI', description: 'Moorland (HMP & YOI)' },
    activeCaseLoadId: 'MDI',
  } as unknown as HmppsUser

  beforeEach(() => {
    jest
      .spyOn(trace, 'getActiveSpan')
      .mockReturnValue({ setAttribute } as unknown as ReturnType<typeof trace.getActiveSpan>)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  function recordedAttributes(currentUser: HmppsUser | undefined): Record<string, unknown> {
    const res = { locals: { user: currentUser } } as unknown as Parameters<ReturnType<typeof userTelemetry>>[1]
    userTelemetry()({} as Request, res, next)
    expect(next).toHaveBeenCalled()
    return Object.fromEntries(setAttribute.mock.calls)
  }

  it('records the username, user ids and active caseload of the signed-in user', () => {
    expect(recordedAttributes(user)).toEqual({
      username: 'USER1',
      userId: '231232',
      userUuid: '11111111-1111-1111-1111-111111111111',
      activeCaseLoadId: 'MDI',
    })
  })

  it('leaves out details the user does not have', () => {
    expect(
      recordedAttributes({
        ...user,
        userId: undefined,
        userUuid: undefined,
        activeCaseLoad: undefined,
        activeCaseLoadId: undefined,
      }),
    ).toEqual({ username: 'USER1' })
  })

  it('records nothing when there is no user', () => {
    expect(recordedAttributes(undefined)).toEqual({})
  })
})
