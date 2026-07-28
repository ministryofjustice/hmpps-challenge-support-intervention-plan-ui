import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import type { NextFunction, Request, Response } from 'express'
import { validate } from 'uuid'

export type JourneyStateGuard = { [pageName: string]: (req: Request) => string | undefined }

export function isMissingValues<T>(obj: T, keys: Array<keyof T>): boolean {
  return keys.some(key => obj?.[key] === undefined)
}

export function allPagesRequireCsipRecord(): JourneyStateGuard {
  return { '*': (req: Request) => (req.journeyData?.csipRecord ? undefined : '/') }
}

const recordJourneyGuardFailedEvent = (
  res: Response,
  failReason: 'PRISONER_MISSING' | 'INVALID_STATE',
  csipId: string | undefined,
  flow: string | undefined,
  requestedPage: string | undefined,
  redirectTo: string | undefined,
) => {
  telemetry.trackEvent('JourneyStateGuardCheckFailed', {
    failReason,
    username: res.locals.user.displayName,
    ...(res.locals.user.activeCaseLoad?.caseLoadId && {
      activeCaseLoadId: res.locals.user.activeCaseLoad.caseLoadId,
    }),
    ...(csipId && { csipId }),
    ...(res.locals.prisoner?.prisonerNumber && { prisonerNumber: res.locals.prisoner.prisonerNumber }),
    ...(flow && { flow }),
    ...(requestedPage && { requestedPage }),
    ...(redirectTo && { redirectTo }),
  })
}

export default function journeyStateGuard(rules: JourneyStateGuard) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const [, uuid, flow, requestedPage] = req.originalUrl.split('/')
    const csipIdInRequest = req.journeyData?.csipRecord?.recordUuid

    if (!uuid || !validate(uuid) || flow === 'csip-record' || req.originalUrl.endsWith('/start')) {
      // This page does not concern us
      return next()
    }

    if (!req.journeyData?.stateGuard) {
      return next()
    }

    const { journeyData } = req

    // All journeys need journeyData to be populated with prisoner data

    if (!req.journeyData?.prisoner) {
      // The relevant /start for this journey has not been visited
      // We don't have a CSIP record id so we can't automatically do this.
      recordJourneyGuardFailedEvent(res, 'PRISONER_MISSING', csipIdInRequest, flow, requestedPage, '/')
      return res.redirect(`/`)
    }

    if (!requestedPage || !flow) {
      return next()
    }

    let redirectTo
    let latestValidPage = requestedPage

    while (latestValidPage !== null) {
      if (latestValidPage === 'confirmation') {
        if (journeyData?.journeyCompleted) {
          return next()
        }

        latestValidPage = 'check-answers'
        redirectTo = '/check-answers'
      }

      const guardFn = rules[latestValidPage] || rules['*']

      if (guardFn === undefined) {
        // We've backtracked all the way to a page that requires no validation
        if (requestedPage === latestValidPage) {
          return next()
        }
        recordJourneyGuardFailedEvent(res, 'INVALID_STATE', csipIdInRequest, flow, requestedPage, redirectTo)
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }

      const targetRedirect = guardFn({
        ...req,
        journeyData,
        url: redirectTo ? `/${uuid}/${flow}${redirectTo}` : req.originalUrl,
      } as Request)

      if (targetRedirect === undefined) {
        // We passed validation for this page, either redirect if we've had to backtrack or next() if not
        if (requestedPage === latestValidPage) {
          return next()
        }
        recordJourneyGuardFailedEvent(res, 'INVALID_STATE', csipIdInRequest, flow, requestedPage, redirectTo)
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }
      latestValidPage = targetRedirect.startsWith('/') ? targetRedirect.split('/')[1] || '' : targetRedirect
      redirectTo = targetRedirect
    }

    return next()
  }
}
