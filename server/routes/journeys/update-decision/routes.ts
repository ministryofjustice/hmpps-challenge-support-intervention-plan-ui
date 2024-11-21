import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateDecisionController } from './controller'
import { UpdateConclusionRoutes } from './conclusion/routes'
import { UpdateAdditionalInformationRoutes } from './additional-information/routes'
import { UpdateNextStepsRoutes } from './next-steps/routes'
import authorisationMiddleware from '../../../middleware/authorisationMiddleware'
import AuthorisedRoles from '../../../authentication/authorisedRoles'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateDecisionController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/conclusion', UpdateConclusionRoutes(csipApiService))
  router.use('/additional-information', UpdateAdditionalInformationRoutes(csipApiService))
  router.use('/next-steps', UpdateNextStepsRoutes(csipApiService))

  return router
}

export const UpdateDecisionRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use(
    '/csip-record/:csipRecordId/update-decision/start',
    authorisationMiddleware([AuthorisedRoles.ROLE_CSIP_PROCESSOR]),
    StartJourneyRoutes(services),
  )
  router.use(path, authorisationMiddleware([AuthorisedRoles.ROLE_CSIP_PROCESSOR]), Routes(services))

  return router
}
