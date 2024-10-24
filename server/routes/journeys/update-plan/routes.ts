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

function Routes({ csipApiService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdatePlanController(csipApiService)

  // update plan journeys
  get('/', updateController.UPDATE)
  router.use('/case-management', CaseManagementRoutes(csipApiService))
  router.use('/next-review-date', UpdateNextReviewDateRoutes(csipApiService))

  // update identified needs journeys
  router.use('/identified-needs', UpdateIdentifiedNeedsRoutes(csipApiService))
  router.use('/update-identified-need/:identifiedNeedUuid', UpdateIdentifiedNeedRoutes(csipApiService))
  router.use('/update-intervention-details/:identifiedNeedUuid', UpdateInterventionDetailsRoutes(csipApiService))
  router.use('/update-planned-intervention/:identifiedNeedUuid', UpdatePlannedInterventionRoutes(csipApiService))
  router.use('/update-actions-progress/:identifiedNeedUuid', UpdateActionsProgressRoutes(csipApiService))
  router.use('/close-identified-need/:identifiedNeedUuid', CloseIdentifiedNeedRoutes(csipApiService))
  router.use('/reopen-identified-need/:identifiedNeedUuid', ReopenIdentifiedNeedRoutes(csipApiService))

  // add new identified need journey
  router.use('/summarise-identified-need', NewIdentifiedNeedRoutes())
  router.use('/intervention-details', NewInterventionDetailsRoutes())
  router.use('/record-actions-progress', NewActionsProgressionRoutes())
  router.use('/check-answers', NewIdentifiedNeedCheckAnswersRoutes(csipApiService))

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
