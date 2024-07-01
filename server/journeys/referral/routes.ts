import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { ReferralRootController } from './controller'
import { OnBehalfOfRoutes } from './on-behalf-of/routes'
import type CsipApiService from '../../services/csipApi/csipApiService'
import { ReferralAreaOfWorkRoutes } from './area-of-work/routes'
import type PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import StartJourneyRoutes from './start/routes'

function Routes(csipApiService: CsipApiService): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const referralRootController = new ReferralRootController()

  get('/', referralRootController.GET)

  router.use('/on-behalf-of', OnBehalfOfRoutes())
  router.use('/area-of-work', ReferralAreaOfWorkRoutes(csipApiService))

  return router
}

export default function routes(csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  router.use('/referral', Routes(csipApiService))

  router.use('/', StartJourneyRoutes(prisonerSearchService))

  return router
}
