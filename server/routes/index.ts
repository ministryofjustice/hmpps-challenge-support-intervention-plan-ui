import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import insertJourneyIdentifier from '../middleware/insertJourneyIdentifier'
import redirectCheckAnswersMiddleware from '../middleware/redirectCheckAnswersMiddleware'
import journeyStateMachine from '../middleware/journeyStateMachine'
import { JourneyRoutes } from './journeys/routes'
import { CsipRecordRoutes } from './csip-records/routes'
import { PrisonerRoutes } from './prisoners/routes'

export default function routes(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res) => {
    await services.auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    res.render('pages/index')
  })

  router.use('/csip-records/:recordUuid', CsipRecordRoutes(services))
  router.use('/prisoners/:prisonNumber', PrisonerRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use(
    redirectCheckAnswersMiddleware([
      /on-behalf-of$/,
      /referrer$/,
      /area-of-work$/,
      /check-answers$/,
      /interview-details\/\d+$/,
      /delete-interview\/\d+$/,
      /summarise-identified-need\/\d+$/,
      /record-actions-progress\/\d+$/,
      /intervention-details\/\d+$/,
      /delete-identified-need\/\d+$/,
    ]),
  )
  router.use(journeyStateMachine())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
