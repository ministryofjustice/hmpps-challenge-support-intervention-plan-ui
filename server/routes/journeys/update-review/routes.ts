import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateReviewController } from './controller'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateReviewController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  return router
}

export const UpdateReviewRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-review/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
