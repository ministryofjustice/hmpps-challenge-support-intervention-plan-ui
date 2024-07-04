import { Router } from 'express'
import { OnBehalfOfRoutes } from './on-behalf-of/routes'
import CsipApiService from '../../services/csipApi/csipApiService'
import { ReferralAreaOfWorkRoutes } from './area-of-work/routes'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import StartJourneyRoutes from './start/routes'
import { ReferralReferrerRoutes } from './referrer/routes'
import { validateJourneyState } from '../../middleware/stateValidationMiddleware'
import { states } from './states'

function Routes(csipApiService: CsipApiService): Router {
  const router = Router({ mergeParams: true })

  router.use('/on-behalf-of', OnBehalfOfRoutes())
  router.use('/area-of-work', ReferralAreaOfWorkRoutes(csipApiService))
  router.use('/referrer', ReferralReferrerRoutes(csipApiService))

  return router
}

export default function routes(csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  router.use('/', StartJourneyRoutes(prisonerSearchService))
  router.use('/referral', validateJourneyState(states), Routes(csipApiService))

  return router
}
