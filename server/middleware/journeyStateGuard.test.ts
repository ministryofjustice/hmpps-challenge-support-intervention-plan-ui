import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import type { NextFunction, Request, Response } from 'express'
import journeyStateGuard from './journeyStateGuard'

jest.mock('uuid', () => ({ validate: () => true }))

describe('journeyStateGuard telemetry', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('records a shared telemetry event when required journey state is missing', () => {
    const trackEvent = jest.spyOn(telemetry, 'trackEvent').mockImplementation()
    const req = {
      originalUrl: '/11111111-1111-4111-8111-111111111111/referral/details',
      journeyData: {
        stateGuard: {},
      },
    } as unknown as Request
    const res = {
      locals: {
        user: {
          displayName: 'Test User',
          activeCaseLoad: { caseLoadId: 'MDI' },
        },
      },
      redirect: jest.fn(),
    } as unknown as Response
    const next = jest.fn() as NextFunction

    journeyStateGuard({})(req, res, next)

    expect(trackEvent).toHaveBeenCalledWith('JourneyStateGuardCheckFailed', {
      failReason: 'PRISONER_MISSING',
      username: 'Test User',
      activeCaseLoadId: 'MDI',
      flow: 'referral',
      requestedPage: 'details',
      redirectTo: '/',
    })
    expect(res.redirect).toHaveBeenCalledWith('/')
    expect(next).not.toHaveBeenCalled()
  })
})
