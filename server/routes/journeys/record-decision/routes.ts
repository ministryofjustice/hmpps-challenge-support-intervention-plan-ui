import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { RecordDecisionController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { NextStepsRoutes } from './next-steps/routes'

function Routes({ csipApiService }: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new RecordDecisionController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.POST)
  router.use('/next-steps', NextStepsRoutes())

  return router
}

export const DecisionRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-decision/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
