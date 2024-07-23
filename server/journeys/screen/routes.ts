import { Router } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import StartJourneyRoutes from './start/routes'
import { ScreenRoutes } from './screen/routes'

function Routes(csipApiService: CsipApiService): Router {
  const router = Router({ mergeParams: true })

  router.use('/screen', ScreenRoutes(csipApiService))

  return router
}

export default function routes(csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  router.use('/', StartJourneyRoutes(csipApiService, prisonerSearchService))
  router.use('/screen', Routes(csipApiService))

  return router
}
