import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { DevelopPlanController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'

function Routes(_services: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new DevelopPlanController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}

export const DevelopPlanRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/develop-an-initial-plan/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
