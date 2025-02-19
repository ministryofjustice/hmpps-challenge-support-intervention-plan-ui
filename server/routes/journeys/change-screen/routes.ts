import { Request } from 'express'
import journeyStateGuard, { isMissingValues } from '../../../middleware/journeyStateGuard'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import StartJourneyRoutes from './start/routes'
import CheckRoutes from '../check-change-screen/routes'
import { ChangeScreenController } from './controller'

function Routes(services: Services) {
  const { router, get } = JourneyRouter()
  const controller = new ChangeScreenController(services.csipApiService)

  get('/', controller.GET)

  return router
}

export const ChangeScreenRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-records/:csipRecordId/change-screen/start', StartJourneyRoutes(services))
  router.use('/check-change-screen', CheckRoutes())
  router.use(path, journeyStateGuard(guard, services.appInsightsClient))
  router.use(path, Routes(services))

  return router
}

const guard = {
  'check-answers': (req: Request) =>
    isMissingValues(req.journeyData.saferCustodyScreening!, ['outcomeType', 'reasonForDecision']) ? '' : undefined,
}
