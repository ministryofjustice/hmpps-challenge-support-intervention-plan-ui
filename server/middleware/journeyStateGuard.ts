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

    const [, uuid, flow, page] = req.originalUrl.split('/')

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

    if (!page || !flow) {
      return next()
    }

    let redirectTo
    let currentPage = page

    while (currentPage !== null) {
      if (currentPage === 'confirmation') {
        if (journeyData?.journeyCompleted) {
          return next()
        }

        currentPage = 'check-answers'
        redirectTo = '/check-answers'
      }

      const journeyState = rules[currentPage]

      if (journeyState === undefined) {
        // We've backtracked all the way to a page that requires no validation
        if (page === currentPage) {
          return next()
        }
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }

      const targetRedirect = journeyState?.({
        ...req,
        journeyData,
        url: redirectTo ? `/${uuid}/${flow}${redirectTo}` : req.originalUrl,
      } as Request)

      if (targetRedirect === undefined) {
        // We passed validation for this page, either redirect if we've had to backtrack or next() if not
        if (page === currentPage) {
          return next()
        }
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }
      currentPage = targetRedirect.startsWith('/') ? targetRedirect.split('/')[1] || '' : targetRedirect
      redirectTo = targetRedirect
    }

    return next()
  }
}
