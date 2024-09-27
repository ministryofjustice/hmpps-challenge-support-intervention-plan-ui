import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateInvestigationController } from './controller'
import { UpdateStaffInvolvedRoutes } from './staff-involved/routes'
import { UpdateUsualBehaviourRoutes } from './usual-behaviour-presentation/routes'
import { UpdateWhyBehaviourOccurredRoutes } from './why-behaviour-occurred/routes'
import { UpdateEvidenceSecuredRoutes } from './evidence-secured/routes'
import { UpdateTriggersRoutes } from './triggers/routes'
import { UpdateInterviewRoutes } from './interview-details/routes'
import { UpdateProtectiveFactorsRoutes } from './protective-factors/routes'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateInvestigationController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/staff-involved', UpdateStaffInvolvedRoutes(csipApiService))
  router.use('/usual-behaviour-presentation', UpdateUsualBehaviourRoutes(csipApiService))
  router.use('/why-behaviour-occurred', UpdateWhyBehaviourOccurredRoutes(csipApiService))
  router.use('/evidence-secured', UpdateEvidenceSecuredRoutes(csipApiService))
  router.use('/triggers', UpdateTriggersRoutes(csipApiService))
  router.use('/interview-details/:index', UpdateInterviewRoutes(csipApiService))
  router.use('/protective-factors', UpdateProtectiveFactorsRoutes(csipApiService))

  return router
}

export const UpdateInvestigationRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-investigation/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
