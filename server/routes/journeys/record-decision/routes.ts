import { Request } from 'express'
import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { RecordDecisionController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { NextStepsRoutes } from './next-steps/routes'
import { ConclusionRoutes } from './conclusion/routes'
import { DecisionAdditionalInformationRoutes } from './additional-information/routes'
import { DecisionCheckAnswersRoutes } from './check-answers/routes'
import { ConfirmationRoutes } from './confirmation/routes'
import journeyStateGuard, { JourneyStateGuard, isMissingValues } from '../../../middleware/journeyStateGuard'
import { CancelController } from '../../cancellation-check/controller'

function Routes({ csipApiService, auditService }: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new RecordDecisionController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.POST)
  router.use('/next-steps', NextStepsRoutes())
  router.use('/conclusion', ConclusionRoutes(csipApiService))
  router.use('/additional-information', DecisionAdditionalInformationRoutes())
  router.use('/check-answers', DecisionCheckAnswersRoutes(csipApiService, auditService))
  router.use('/confirmation', ConfirmationRoutes())
  router.use(
    '/cancellation-check',
    new CancelController('investigation decision', 'Record a CSIP investigation decision', 'record').GET,
  )

  return router
}

export const DecisionRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-decision/start', StartJourneyRoutes(services))
  router.use(path, journeyStateGuard(guard, services.appInsightsClient))
  router.use(path, Routes(services))
  return router
}

export const guard: JourneyStateGuard = {
  conclusion: (req: Request) =>
    isMissingValues(req.journeyData.decisionAndActions!, ['signedOffByRole']) ? '' : undefined,
  'next-steps': (req: Request) =>
    isMissingValues(req.journeyData.decisionAndActions!, ['outcome', 'conclusion']) ? '/conclusion' : undefined,
  'additional-information': (req: Request) =>
    isMissingValues(req.journeyData.decisionAndActions!, ['outcome', 'conclusion']) ? '/conclusion' : undefined,
  'check-answers': (req: Request) =>
    isMissingValues(req.journeyData.decisionAndActions!, ['outcome', 'conclusion']) ? '/conclusion' : undefined,
}
