import { Request } from 'express'
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
import { ReviewCheckAnswersRoutes } from './check-answers/routes'
import { CloseCsipRoutes } from './close-csip/routes'
import { ConfirmationRoutes } from './confirmation/routes'
import journeyStateGuard, { isMissingValues } from '../../../middleware/journeyStateGuard'
import { CancelController } from '../../cancellation-check/controller'

function Routes({ csipApiService, auditService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new RecordReviewController(csipApiService)

  get('/', controller.GET)

  router.use('/details', SummaryRoutes())
  router.use('/outcome', OutcomeRoutes())
  router.use('/participants-summary', ParticipantsSummaryRoutes())
  router.use('/delete-participant/:index', DeleteParticipantRoutes(csipApiService))
  router.use('/participant-contribution-details/:index', ParticipantDetailsRoutes(csipApiService))
  router.use('/next-review-date', NextReviewDateRoutes())
  router.use('/check-answers', ReviewCheckAnswersRoutes(csipApiService, auditService))
  router.use('/close-csip', CloseCsipRoutes())
  router.use('/confirmation', ConfirmationRoutes())
  router.use('/cancellation-check', new CancelController('review', 'Record a CSIP review', 'record').GET)

  return router
}

export const RecordReviewRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-review/start', StartJourneyRoutes(services))
  router.use(path, journeyStateGuard(guard, services.appInsightsClient))
  router.use(path, Routes(services))

  return router
}

enum ReviewOutcome {
  CLOSE_CSIP = 'CLOSE_CSIP',
  REMAIN_ON_CSIP = 'REMAIN_ON_CSIP',
}

const guard = {
  'next-review-date': (req: Request) => {
    if (req.journeyData.review?.outcomeSubJourney?.outcome === ReviewOutcome.CLOSE_CSIP) {
      return '/close-csip'
    }

    if (req.journeyData.review?.outcome === ReviewOutcome.CLOSE_CSIP) {
      return '/check-answers'
    }

    if (!req.journeyData.review?.outcome && !req.journeyData.review?.outcomeSubJourney?.outcome) {
      return '/outcome'
    }
    return undefined
  },
  'close-csip': (req: Request) => {
    if (req.journeyData.review?.outcomeSubJourney?.outcome === ReviewOutcome.REMAIN_ON_CSIP) {
      return '/next-review-date'
    }

    if (req.journeyData.review?.outcome === ReviewOutcome.REMAIN_ON_CSIP) {
      return '/check-answers'
    }

    if (!req.journeyData.review?.outcome && !req.journeyData.review?.outcomeSubJourney?.outcome) {
      return '/outcome'
    }
    return undefined
  },
  'check-answers': (req: Request) => {
    const { review } = req.journeyData

    if (review?.outcome === ReviewOutcome.REMAIN_ON_CSIP && !review?.nextReviewDate) {
      return '/next-review-date'
    }

    const isMissingProps = isMissingValues(
      review!,
      review?.outcome === ReviewOutcome.CLOSE_CSIP ? ['outcome', 'summary'] : ['nextReviewDate', 'outcome', 'summary'],
    )

    if (isMissingProps || !review?.attendees?.length) {
      return ''
    }

    return undefined
  },
}
