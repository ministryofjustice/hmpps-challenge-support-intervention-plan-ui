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
import authorisationMiddleware from '../../../middleware/authorisationMiddleware'
import AuthorisedRoles from '../../../authentication/authorisedRoles'

function Routes({ csipApiService }: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new RecordDecisionController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.POST)
  router.use('/next-steps', NextStepsRoutes())
  router.use('/conclusion', ConclusionRoutes(csipApiService))
  router.use('/additional-information', DecisionAdditionalInformationRoutes())
  router.use('/check-answers', DecisionCheckAnswersRoutes(csipApiService))
  router.use('/confirmation', ConfirmationRoutes())

  return router
}

export const DecisionRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use(
    '/csip-record/:csipRecordId/record-decision/start',
    authorisationMiddleware([AuthorisedRoles.ROLE_CSIP_PROCESSOR]),
    StartJourneyRoutes(services),
  )
  router.use(path, authorisationMiddleware([AuthorisedRoles.ROLE_CSIP_PROCESSOR]), Routes(services))

  return router
}
