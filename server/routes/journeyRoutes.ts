import { Router } from 'express'

import type { Services } from '../services'
import referralRoutes from '../journeys/referral/routes'
import StartJourneyRoutes from '../journeys/start/routes'

import populatePrisonerSummary from '../middleware/populatePrisonerSummary'

export default function journeyRoutes({ prisonerSearchService, csipApiService }: Services): Router {
  const router = Router({ mergeParams: true })

  router.use(populatePrisonerSummary())

  router.use('/prisoners', StartJourneyRoutes(prisonerSearchService))
  router.use('/referral', referralRoutes(csipApiService))

  return router
}
