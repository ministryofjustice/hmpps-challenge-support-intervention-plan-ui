import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import referralRoutes from '../journeys/referral/routes'
import PrisonerImageRoutes from './prisonerImageRoutes'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes({ auditService, prisonerImageService }: Services): Router {
  const router = Router({ mergeParams: true })
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    res.render('pages/index')
  })

  get('/prisoner-image/:prisonerNumber', new PrisonerImageRoutes(prisonerImageService).GET)

  router.use('/referral', referralRoutes())

  return router
}
