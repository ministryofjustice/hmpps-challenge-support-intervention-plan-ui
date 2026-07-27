import { EventEmitter } from 'node:events'
import { trace, Span } from '@opentelemetry/api'
import type { NextFunction, Request, Response } from 'express'
import { appInsightsMiddleware, isIgnoredAppInsightsRequest } from './azureAppInsights'

describe('isIgnoredAppInsightsRequest', () => {
  it.each(['/health', '/ping', '/metrics', '/health?source=kubernetes'])('filters the operational endpoint %s', url => {
    expect(isIgnoredAppInsightsRequest({ url })).toBe(true)
  })

  it.each(['/healthcheck', '/manage-csips', undefined])('keeps the application endpoint %s', url => {
    expect(isIgnoredAppInsightsRequest({ url })).toBe(false)
  })
})

describe('appInsightsMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('preserves the route name and user dimensions on the active request span', () => {
    const span = {
      updateName: jest.fn(),
      setAttribute: jest.fn(),
    } as unknown as Span
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span)

    const req = {
      method: 'GET',
      route: { path: '/prisoners/:prisonerNumber' },
    } as Request
    const res = Object.assign(new EventEmitter(), {
      locals: {
        user: {
          username: 'USER1',
          activeCaseLoad: { caseLoadId: 'MDI' },
        },
      },
    }) as unknown as Response
    const next = jest.fn() as NextFunction

    appInsightsMiddleware()(req, res, next)
    res.emit('finish')

    expect(next).toHaveBeenCalledTimes(1)
    expect(span.updateName).toHaveBeenCalledWith('GET /prisoners/:prisonerNumber')
    expect(span.setAttribute).toHaveBeenCalledWith('username', 'USER1')
    expect(span.setAttribute).toHaveBeenCalledWith('activeCaseLoadId', 'MDI')
  })

  it('does not annotate a request when there is no active span', () => {
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined)

    const req = { method: 'GET', route: { path: '/manage-csips' } } as Request
    const res = Object.assign(new EventEmitter(), { locals: {} }) as unknown as Response
    const next = jest.fn() as NextFunction

    appInsightsMiddleware()(req, res, next)

    expect(() => res.emit('finish')).not.toThrow()
    expect(next).toHaveBeenCalledTimes(1)
  })
})
