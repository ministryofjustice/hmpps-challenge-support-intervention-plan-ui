import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { RecordReviewController } from './controller'
import { SummaryRoutes } from './details/routes'
import { ParticipantsSummaryRoutes } from './participants-summary/routes'

import { OutcomeRoutes } from './outcome/routes'

import { NextReviewDateRoutes } from './next-review-date/routes'

function Routes({ csipApiService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new RecordReviewController(csipApiService)

  get('/', controller.GET)

  router.use('/details', SummaryRoutes())
  router.use('/outcome', OutcomeRoutes())
  router.use('/participants-summary', ParticipantsSummaryRoutes())

  router.use('/next-review-date', NextReviewDateRoutes())
  return router
}

export const RecordReviewRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-review/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
