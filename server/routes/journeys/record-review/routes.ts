import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { RecordReviewController } from './controller'

function Routes({ csipApiService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new RecordReviewController(csipApiService)

  get('/', controller.GET)

  return router
}

export const RecordReviewRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-review/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
