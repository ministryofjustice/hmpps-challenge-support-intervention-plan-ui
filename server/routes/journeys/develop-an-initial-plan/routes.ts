import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { DevelopPlanController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { IdentifiedNeedsRoutes } from './identified-needs/routes'
import { SummariseIdentifiedNeedRoutes } from './summarise-identified-need/routes'
import { RecordActionsProgressRoutes } from './record-actions-progress/routes'
import { DeleteIdentifiedNeedRoutes } from './delete-identified-need/routes'

function Routes(_services: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new DevelopPlanController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  router.use('/identified-needs', IdentifiedNeedsRoutes())
  router.use('/summarise-identified-need', SummariseIdentifiedNeedRoutes())
  router.use('/record-actions-progress', RecordActionsProgressRoutes())
  router.use('/delete-identified-need/:index', DeleteIdentifiedNeedRoutes())

  return router
}

export const DevelopPlanRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/develop-an-initial-plan/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
