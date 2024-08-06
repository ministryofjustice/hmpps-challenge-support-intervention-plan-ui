import StartJourneyRoutes from './start/routes'
import { ScreenRoutes } from './screen/routes'
import { ScreenCheckAnswersRoutes } from './check-answers/routes'
import { ConfirmationRoutes } from './confirmation/routes'
import { Services } from '../../services'
import { JourneyRouter } from '../base/routes'

function Routes({ csipApiService }: Services) {
  const { router } = JourneyRouter()

  router.use('/screen', ScreenRoutes(csipApiService))
  router.use('/check-answers', ScreenCheckAnswersRoutes(csipApiService))
  router.use('/confirmation', ConfirmationRoutes())

  return router
}

export default function routes(services: Services) {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/screen/start', StartJourneyRoutes(services))
  router.use('/screen', Routes(services))

  return router
}
