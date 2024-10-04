import { CaseManagementRoutes } from './case-management/routes'
import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdatePlanController } from './controller'
import { UpdateNextReviewDateRoutes } from './next-review-date/routes'
import { UpdateInterventionDetailsRoutes } from './update-intervention-details/routes'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdatePlanController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)
  router.use('/case-management', CaseManagementRoutes(csipApiService))
  router.use('/next-review-date', UpdateNextReviewDateRoutes(csipApiService))
  router.use('/update-intervention-details/:identifiedNeedUuid', UpdateInterventionDetailsRoutes(csipApiService))

  return router
}

export const UpdatePlanRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-plan/start', StartJourneyRoutes(services, '/update-plan'))
  router.use(
    '/csip-record/:csipRecordId/update-plan/identified-needs/start',
    StartJourneyRoutes(services, '/update-plan/identified-needs'),
  )
  router.use(path, Routes(services))

  return router
}
