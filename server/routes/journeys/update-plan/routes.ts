import { CaseManagementRoutes } from './case-management/routes'
import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdatePlanController } from './controller'
import { UpdateNextReviewDateRoutes } from './next-review-date/routes'
import { UpdateInterventionDetailsRoutes } from './update-intervention-details/routes'
import { UpdateIdentifiedNeedsRoutes } from './identified-needs/routes'
import { UpdatePlannedInterventionRoutes } from './planned-intervention/routes'
import { NewInterventionDetailsRoutes } from './intervention-details/routes'
import { UpdateIdentifiedNeedRoutes } from './update-identified-need/routes'
import { CloseIdentifiedNeedRoutes } from './close-identified-need/routes'
import { UpdateActionsProgressRoutes } from './update-actions-progress/routes'
import { ReopenIdentifiedNeedRoutes } from './reopen-identified-need/routes'
import { NewIdentifiedNeedRoutes } from './summarise-identified-need/routes'
import { NewActionsProgressionRoutes } from './record-actions-progress/routes'
import { NewIdentifiedNeedCheckAnswersRoutes } from './check-answers/routes'

function Routes({ csipApiService, auditService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdatePlanController(csipApiService)

  // update plan journeys
  get('/', updateController.UPDATE)
  router.use('/case-management', CaseManagementRoutes(csipApiService, auditService))
  router.use('/next-review-date', UpdateNextReviewDateRoutes(csipApiService, auditService))

  // update identified needs journeys
  router.use('/identified-needs', UpdateIdentifiedNeedsRoutes(csipApiService, auditService))
  router.use('/update-identified-need/:identifiedNeedUuid', UpdateIdentifiedNeedRoutes(csipApiService, auditService))
  router.use(
    '/update-intervention-details/:identifiedNeedUuid',
    UpdateInterventionDetailsRoutes(csipApiService, auditService),
  )
  router.use(
    '/update-planned-intervention/:identifiedNeedUuid',
    UpdatePlannedInterventionRoutes(csipApiService, auditService),
  )
  router.use('/update-actions-progress/:identifiedNeedUuid', UpdateActionsProgressRoutes(csipApiService, auditService))
  router.use('/close-identified-need/:identifiedNeedUuid', CloseIdentifiedNeedRoutes(csipApiService, auditService))
  router.use('/reopen-identified-need/:identifiedNeedUuid', ReopenIdentifiedNeedRoutes(csipApiService, auditService))

  // add new identified need journey
  router.use('/summarise-identified-need', NewIdentifiedNeedRoutes())
  router.use('/intervention-details', NewInterventionDetailsRoutes())
  router.use('/record-actions-progress', NewActionsProgressionRoutes())
  router.use('/check-answers', NewIdentifiedNeedCheckAnswersRoutes(csipApiService, auditService))

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
