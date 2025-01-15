import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateDecisionController } from './controller'
import { UpdateConclusionRoutes } from './conclusion/routes'
import { UpdateAdditionalInformationRoutes } from './additional-information/routes'
import { UpdateNextStepsRoutes } from './next-steps/routes'
import journeyStateGuard, { allPagesRequireCsipRecord } from '../../../middleware/journeyStateGuard'

function Routes({ csipApiService, prisonerSearchService, auditService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateDecisionController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/conclusion', UpdateConclusionRoutes(csipApiService, auditService))
  router.use('/additional-information', UpdateAdditionalInformationRoutes(csipApiService, auditService))
  router.use('/next-steps', UpdateNextStepsRoutes(csipApiService, auditService))

  return router
}

export const UpdateDecisionRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-decision/start', StartJourneyRoutes(services))
  router.use(path, journeyStateGuard(allPagesRequireCsipRecord(), services.appInsightsClient))
  router.use(path, Routes(services))

  return router
}
