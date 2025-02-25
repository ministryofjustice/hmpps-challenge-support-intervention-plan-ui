import { ChangeScreenCheckAnswersRoutes } from './check-answers/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import StartJourneyRoutes from './start/routes'
import CheckRoutes from '../check-change-screen/routes'
import { ChangeScreenController } from './controller'
import { schemaFactory } from '../screen/schemas'
import { validate } from '../../../middleware/validationMiddleware'

function Routes(services: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new ChangeScreenController(services.csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(services.csipApiService)), controller.POST)

  router.use('/check-answers', ChangeScreenCheckAnswersRoutes(services.csipApiService, services.auditService))

  return router
}

export const ChangeScreenRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/change-screen/start', StartJourneyRoutes(services))
  router.use('/check-change-screen', CheckRoutes())
  router.use(path, Routes(services))

  return router
}
