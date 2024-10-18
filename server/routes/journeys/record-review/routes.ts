import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { RecordReviewController } from './controller'
import { SummaryRoutes } from './details/routes'
import { ParticipantsSummaryRoutes } from './participants-summary/routes'
import { OutcomeRoutes } from './outcome/routes'
import { DeleteParticipantRoutes } from './delete-participant/routes'
import { ParticipantDetailsRoutes } from './participant-contribution-details/routes'
import { NextReviewDateRoutes } from './next-review-date/routes'
import { CloseCsipRoutes } from './close-csip/routes'
import { ConfirmationRoutes } from './confirmation/routes'

function Routes({ csipApiService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new RecordReviewController(csipApiService)

  get('/', controller.GET)

  router.use('/details', SummaryRoutes())
  router.use('/outcome', OutcomeRoutes())
  router.use('/participants-summary', ParticipantsSummaryRoutes())
  router.use('/delete-participant/:index', DeleteParticipantRoutes(csipApiService))
  router.use('/participant-contribution-details/:index', ParticipantDetailsRoutes(csipApiService))
  router.use('/next-review-date', NextReviewDateRoutes())
  router.use('/close-csip', CloseCsipRoutes())
  router.use('/confirmation', ConfirmationRoutes())

  return router
}

export const RecordReviewRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-review/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
