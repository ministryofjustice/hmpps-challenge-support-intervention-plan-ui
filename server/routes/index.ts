import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import insertJourneyIdentifier from '../middleware/insertJourneyIdentifier'
import redirectCheckAnswersMiddleware from '../middleware/redirectCheckAnswersMiddleware'
import journeyStateMachine from '../middleware/journeyStateMachine'
import { JourneyRoutes } from './journeys/routes'
import { CsipRecordRoutes } from './csip-records/routes'
import { SearchCsipRoutes } from './manage-csips/routes'
import { HomePageController } from './controller'

export default function routes(services: Services): Router {
  const router = Router({ mergeParams: true })
  const controller = new HomePageController(services.csipApiService)
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  router.use('/csip-records/:recordUuid', CsipRecordRoutes(services))
  router.use('/manage-csips', SearchCsipRoutes(services))
  router.get('/how-to-make-a-referral', (_req, res) =>
    res.render('how-to-make-a-referral/view', { showBreadcrumbs: true }),
  )

  router.use(insertJourneyIdentifier())

  router.use((_req, res, next) => {
    console.log('6')
    const resRender = res.render
    console.log('7')
    res.render = (view: string, options?) => {
      console.log('resre')
      type resRenderCb = (view: string, options?: object, callback?: (err: Error, html: string) => void) => void
      ;(resRender as resRenderCb).call(res, view, options, async (err: Error, html: string) => {
        if (err) {
          res.status(500).send(err)
          return
        }
        const { pageNameSuffix, ...auditEventProperties } = res.locals.auditEvent
        const ret = await services.auditService.logPageView(`${pageNameSuffix}`, {
          ...auditEventProperties,
        })
        console.log(`access ret: ${JSON.stringify(ret)}`)
        res.send(html)
      })
    }
    console.log('8')
    next()
  })

  get('/', controller.GET)
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

  router.use(journeyStateMachine())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
