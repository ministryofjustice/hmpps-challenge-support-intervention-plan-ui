import type { NextFunction, Request, Response } from 'express'
import { validate } from 'uuid'
import config from '../config'

export type JourneyStateGuard = { [pageName: string]: (req: Request) => string | undefined }

export function isMissingValues<T>(obj: T, keys: Array<keyof T>): boolean {
  return keys.some(key => obj?.[key] === undefined)
}

export default function journeyStateGuard(rules: JourneyStateGuard) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!config.features.stateGuard && process.env.NODE_ENV !== 'e2e-test') {
      // Feature flag is off and we're not cypress tests
      return next()
    }

    const [, uuid, flow, requestedPage] = req.originalUrl.split('/')

    if (!uuid || !validate(uuid) || flow === 'csip-record' || req.originalUrl.endsWith('/start')) {
      // This page does not concern us
      return next()
    }

    if (!req.session.journeyDataMap?.[uuid!]?.stateGuard) {
      return next()
    }

    const journeyData = req.session.journeyDataMap?.[uuid]

    // All journeys need journeyData to be populated with prisoner data

    if (!req.session.journeyDataMap?.[uuid]?.prisoner) {
      // The relevant /start for this journey has not been visited
      // We don't have a CSIP record id so we can't automatically do this.
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

      const guardFn = rules[latestValidPage]

      if (guardFn === undefined) {
        // We've backtracked all the way to a page that requires no validation
        if (requestedPage === latestValidPage) {
          return next()
        }
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
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }
      latestValidPage = targetRedirect.startsWith('/') ? targetRedirect.split('/')[1] || '' : targetRedirect
      redirectTo = targetRedirect
    }

    return next()
  }
}
