import { CaseManagementRoutes } from './case-management/routes'
import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdatePlanController } from './controller'
import { UpdateNextReviewDateRoutes } from './next-review-date/routes'
import { UpdateInterventionDetailsRoutes } from './update-intervention-details/routes'
import { UpdateIdentifiedNeedsRoutes } from './identified-needs/routes'

function Routes({ csipApiService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdatePlanController(csipApiService)

  // update plan journeys
  get('/', updateController.UPDATE)
  router.use('/case-management', CaseManagementRoutes(csipApiService))
  router.use('/next-review-date', UpdateNextReviewDateRoutes(csipApiService))
  
  // update identified needs journeys
  router.use('/identified-needs', UpdateIdentifiedNeedsRoutes(csipApiService))
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
