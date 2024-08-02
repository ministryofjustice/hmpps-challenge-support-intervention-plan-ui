import { Router } from 'express'

import type { Services } from '../services'
import referralRoutes from '../journeys/referral/routes'
import screenRoutes from '../journeys/screen/routes'
import investigationRoutes from '../journeys/record-investigation/routes'

import populatePrisonerSummary from '../middleware/populatePrisonerSummary'

export default function journeyRoutes({ prisonerSearchService, csipApiService }: Services): Router {
  const router = Router({ mergeParams: true })

  router.use(populatePrisonerSummary())

  router.use('/', referralRoutes(csipApiService, prisonerSearchService))
  router.use('/', screenRoutes(csipApiService, prisonerSearchService))
  router.use('/', investigationRoutes(csipApiService, prisonerSearchService))

  return router
}
