import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateReviewController } from './controller'
import { UpdateOutcomeRoutes } from './outcome/routes'
import { UpdateDetailsRoutes } from './details/routes'
import { UpdateNextReviewDateRoutes } from './next-review-date/routes'
import { UpdateAttendeeRoutes } from './update-participant-contribution-details/routes'
import { UpdateCloseCsipRoutes } from './close-csip/routes'
import { AddParticipantContributionDetailsRoutes } from './participant-contribution-details/routes'

function Routes({ csipApiService, prisonerSearchService, auditService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateReviewController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/outcome', UpdateOutcomeRoutes())
  router.use('/details', UpdateDetailsRoutes(csipApiService, auditService))
  router.use('/next-review-date', UpdateNextReviewDateRoutes(csipApiService, auditService))
  router.use(
    '/update-participant-contribution-details/:attendeeUuid',
    UpdateAttendeeRoutes(csipApiService, auditService),
  )
  router.use('/participant-contribution-details', AddParticipantContributionDetailsRoutes(csipApiService, auditService))
  router.use('/close-csip', UpdateCloseCsipRoutes(csipApiService, auditService))

  return router
}

export const UpdateReviewRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-review/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
