import { Request } from 'express'
import StartJourneyRoutes from './start/routes'
import { ScreenCheckAnswersRoutes } from './check-answers/routes'
import { ConfirmationRoutes } from './confirmation/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { ScreenController } from './controller'
import { schemaFactory } from './schemas'
import { validate } from '../../../middleware/validationMiddleware'
import journeyStateGuard, { isMissingValues } from '../../../middleware/journeyStateGuard'
import { CancelController } from '../../cancellation-check/controller'

function Routes({ csipApiService, auditService }: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new ScreenController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.POST)

  router.use('/check-answers', ScreenCheckAnswersRoutes(csipApiService, auditService))
  router.use('/confirmation', ConfirmationRoutes())
  router.use(
    '/cancellation-check',
    new CancelController('screening', 'Screen a CSIP referral', 'record this screening').GET,
  )

  return router
}

export const ScreenRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/screen/start', StartJourneyRoutes(services))
  router.use(path, journeyStateGuard(guard, services.appInsightsClient))
  router.use(path, Routes(services))

  return router
}

const guard = {
  'check-answers': (req: Request) =>
    isMissingValues(req.journeyData.saferCustodyScreening!, ['outcomeType', 'reasonForDecision']) ? '' : undefined,
}
