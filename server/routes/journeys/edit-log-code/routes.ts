import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { EditLogCodeController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import journeyStateGuard, { allPagesRequireCsipRecord } from '../../../middleware/journeyStateGuard'

function Routes({ csipApiService, auditService }: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new EditLogCodeController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}

export const EditLogCodeRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/edit-log-code/start', StartJourneyRoutes(services))
  router.use(path, journeyStateGuard(allPagesRequireCsipRecord(), services.appInsightsClient))
  router.use(path, Routes(services))

  return router
}
