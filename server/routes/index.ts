import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import insertJourneyIdentifier from '../middleware/insertJourneyIdentifier'
import redirectCheckAnswersMiddleware from '../middleware/redirectCheckAnswersMiddleware'
import { JourneyRoutes } from './journeys/routes'
import { CsipRecordRoutes } from './csip-records/routes'
import { SearchCsipRoutes } from './manage-csips/routes'
import { HomePageController } from './controller'
import { PrisonerCsipRoutes } from './prisoner-csips/routes'

export default function routes(services: Services): Router {
  const router = Router({ mergeParams: true })
  const controller = new HomePageController(services.csipApiService)
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', controller.GET)

  router.get('/not-authorised', (_req, res) => {
    res.status(403)
    return res.render('not-authorised', {
      showBreadcrumbs: true,
    })
  })

  router.use('/csip-records/:recordUuid', CsipRecordRoutes(services))
  router.use('/prisoner-csips', PrisonerCsipRoutes(services))
  router.use('/manage-csips', SearchCsipRoutes(services))
  router.use('/manage-plans', SearchCsipRoutes(services))
  router.use('/manage-referrals', SearchCsipRoutes(services))
  router.get('/how-to-make-a-referral', (_req, res) =>
    res.render('how-to-make-a-referral/view', { showBreadcrumbs: true }),
  )
  router.get('/accessibility-statement', (_req, res) =>
    res.render('accessibility-statement/view', { showBreadcrumbs: true }),
  )

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
      /participant-contribution-details\/\d+$/,
      /delete-participant\/\d+$/,
      /record-review\/outcome$/,
      /record-review\/close-csip$/,
      /record-review\/next-review-date$/,
    ]),
  )

  router.use('/:journeyId', JourneyRoutes(services))
  return router
}
