import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import insertJourneyIdentifier from '../middleware/insertJourneyIdentifier'
import journeyRoutes from './journeyRoutes'
import redirectCheckAnswersMiddleware from '../middleware/redirectCheckAnswersMiddleware'

export default function routes(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res) => {
    await services.auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    res.render('pages/index')
  })

  router.use(insertJourneyIdentifier())
  router.use(redirectCheckAnswersMiddleware([/on-behalf-of$/, /referrer$/, /area-of-work$/]))
  router.use('/:journeyId', journeyRoutes(services))

  return router
}
