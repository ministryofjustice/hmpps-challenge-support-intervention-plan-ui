import { Request } from 'express'
import StartJourneyRoutes from './start/routes'
import { RecordInvestigationController } from './controller'
import { StaffInvolvedRoutes } from './staff-involved/routes'
import { OccurrenceReasonRoutes } from './why-behaviour-occurred/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { EvidenceSecuredRoutes } from './evidence-secured/routes'
import { UsualBehaviourPresentationRoutes } from './usual-behaviour-presentation/routes'
import { TriggersRoutes } from './triggers/routes'
import { ProtectiveFactorsRoutes } from './protective-factors/routes'
import { InterviewsSummaryRoutes } from './interviews-summary/routes'
import { InterviewDetailsRoutes } from './interview-details/routes'
import { DeleteInterviewRoutes } from './delete-interview/routes'
import { InvestigationCheckAnswersRoutes } from './check-answers/routes'
import { ConfirmationRoutes } from './confirmation/routes'
import journeyStateGuard, { JourneyStateGuard, isMissingValues } from '../../../middleware/journeyStateGuard'
import { CancelController } from '../../cancellation-check/controller'

function Routes({ csipApiService, auditService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new RecordInvestigationController()

  get('/', controller.GET)
  router.use('/staff-involved', StaffInvolvedRoutes())
  router.use('/why-behaviour-occurred', OccurrenceReasonRoutes())
  router.use('/evidence-secured', EvidenceSecuredRoutes())
  router.use('/usual-behaviour-presentation', UsualBehaviourPresentationRoutes())
  router.use('/triggers', TriggersRoutes())
  router.use('/protective-factors', ProtectiveFactorsRoutes())
  router.use('/interviews-summary', InterviewsSummaryRoutes())
  router.use('/interview-details/:index', InterviewDetailsRoutes(csipApiService))
  router.use('/delete-interview/:index', DeleteInterviewRoutes())
  router.use('/check-answers', InvestigationCheckAnswersRoutes(csipApiService, auditService))
  router.use('/confirmation', ConfirmationRoutes())
  router.use('/cancellation-check', new CancelController('investigation', 'Record a CSIP investigation', 'record').GET)

  return router
}

export const InvestigationRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/record-investigation/start', StartJourneyRoutes(services))
  router.use(path, journeyStateGuard(guard, services.appInsightsClient))
  router.use(path, Routes(services))

  return router
}

const guard: JourneyStateGuard = {
  'check-answers': (req: Request) =>
    isMissingValues(req.journeyData.investigation!, [
      'occurrenceReason',
      'personsTrigger',
      'personsUsualBehaviour',
      'evidenceSecured',
      'protectiveFactors',
      'staffInvolved',
      'interviews',
    ])
      ? ''
      : undefined,
}
