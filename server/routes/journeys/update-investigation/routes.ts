import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateInvestigationController } from './controller'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateInvestigationController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  return router
}

export const UpdateInvestigationRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-investigation/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
