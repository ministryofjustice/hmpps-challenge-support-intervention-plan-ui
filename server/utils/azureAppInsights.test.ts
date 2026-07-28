import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import type { NextFunction, Request, Response } from 'express'
import { telemetryMiddleware } from './azureAppInsights'

describe('telemetryMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('adds the user dimensions to the active request span', () => {
    const setSpanAttributes = jest.spyOn(telemetry, 'setSpanAttributes').mockImplementation()
    const req = {} as Request
    const res = {
      locals: {
        user: {
          username: 'USER1',
          activeCaseLoad: { caseLoadId: 'MDI' },
        },
      },
    } as Response
    const next = jest.fn() as NextFunction

    telemetryMiddleware()(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(setSpanAttributes).toHaveBeenCalledWith({
      username: 'USER1',
      activeCaseLoadId: 'MDI',
    })
  })

  it('adds no user dimensions when they are unavailable', () => {
    const setSpanAttributes = jest.spyOn(telemetry, 'setSpanAttributes').mockImplementation()
    const req = {} as Request
    const res = { locals: { user: {} } } as Response
    const next = jest.fn() as NextFunction

    telemetryMiddleware()(req, res, next)

    expect(setSpanAttributes).toHaveBeenCalledWith({})
    expect(next).toHaveBeenCalledTimes(1)
  })
})
