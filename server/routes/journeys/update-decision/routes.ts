import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateDecisionController } from './controller'
import { UpdateConclusionRoutes } from './conclusion/routes'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateDecisionController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/conclusion', UpdateConclusionRoutes(csipApiService))

  return router
}

export const UpdateDecisionRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-decision/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
