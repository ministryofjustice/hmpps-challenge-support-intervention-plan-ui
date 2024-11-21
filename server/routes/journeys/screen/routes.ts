import StartJourneyRoutes from './start/routes'
import { ScreenCheckAnswersRoutes } from './check-answers/routes'
import { ConfirmationRoutes } from './confirmation/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { ScreenController } from './controller'
import { schemaFactory } from './schemas'
import { validate } from '../../../middleware/validationMiddleware'
import authorisationMiddleware from '../../../middleware/authorisationMiddleware'
import AuthorisedRoles from '../../../authentication/authorisedRoles'

function Routes({ csipApiService }: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new ScreenController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.POST)

  router.use('/check-answers', ScreenCheckAnswersRoutes(csipApiService))
  router.use('/confirmation', ConfirmationRoutes())

  return router
}

export const ScreenRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use(
    '/csip-record/:csipRecordId/screen/start',
    authorisationMiddleware([AuthorisedRoles.ROLE_CSIP_PROCESSOR]),
    StartJourneyRoutes(services),
  )
  router.use(path, authorisationMiddleware([AuthorisedRoles.ROLE_CSIP_PROCESSOR]), Routes(services))

  return router
}
