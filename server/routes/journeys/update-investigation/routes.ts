import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateInvestigationController } from './controller'
import { UpdateStaffInvolvedRoutes } from './staff-involved/routes'
import { UpdateWhyBehaviourOccurredRoutes } from './why-behaviour-occurred/routes'
import { UpdateEvidenceSecuredRoutes } from './evidence-secured/routes'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateInvestigationController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/staff-involved', UpdateStaffInvolvedRoutes(csipApiService))
  router.use('/why-behaviour-occurred', UpdateWhyBehaviourOccurredRoutes(csipApiService))
  router.use('/evidence-secured', UpdateEvidenceSecuredRoutes(csipApiService))

  return router
}

export const UpdateInvestigationRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-investigation/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
