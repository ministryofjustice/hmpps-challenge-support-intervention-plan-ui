import { Request } from 'express'
import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { DevelopPlanController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { IdentifiedNeedsRoutes } from './identified-needs/routes'
import { SummariseIdentifiedNeedRoutes } from './summarise-identified-need/routes'
import { RecordActionsProgressRoutes } from './record-actions-progress/routes'
import { DeleteIdentifiedNeedRoutes } from './delete-identified-need/routes'
import { NextReviewDateRoutes } from './next-review-date/routes'
import { InterventionDetailsRoutes } from './intervention-details/routes'
import { ConfirmationRoutes } from './confirmation/routes'
import { PlanCheckAnswersRoutes } from './check-answers/routes'
import journeyStateGuard, { JourneyStateGuard, isMissingValues } from '../../../middleware/journeyStateGuard'

function Routes({ csipApiService, auditService }: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new DevelopPlanController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  router.use('/identified-needs', IdentifiedNeedsRoutes())
  router.use('/summarise-identified-need/:index', SummariseIdentifiedNeedRoutes())
  router.use('/record-actions-progress/:index', RecordActionsProgressRoutes())
  router.use('/delete-identified-need/:index', DeleteIdentifiedNeedRoutes())
  router.use('/next-review-date', NextReviewDateRoutes())
  router.use('/intervention-details/:index', InterventionDetailsRoutes())
  router.use('/confirmation', ConfirmationRoutes())
  router.use('/check-answers', PlanCheckAnswersRoutes(csipApiService, auditService))

  return router
}

export const DevelopPlanRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/develop-an-initial-plan/start', StartJourneyRoutes(services))

  router.use(path, journeyStateGuard(guard))

  router.use(path, Routes(services))

  return router
}

const parseIdentifiedNeedIndex = (req: Request) => {
  const match = req.url.match(/\/(\d+)(?:#[A-Za-z0-9-]+)?$/) || []
  const index = Number(match[1]) - 1
  return {
    success: !Number.isNaN(index) && (req.journeyData.plan!.identifiedNeeds || []).length >= index,
    isNew: (req.journeyData.plan!.identifiedNeeds || []).length === index,
    index,
  }
}

const guard: JourneyStateGuard = {
  'identified-needs': (req: Request) => (isMissingValues(req.journeyData.plan!, ['reasonForPlan']) ? '' : undefined),
  'next-review-date': (req: Request) =>
    isMissingValues(req.journeyData.plan!, ['identifiedNeeds']) ? '/record-actions-progress/1' : undefined,
  'summarise-identified-need': (req: Request) =>
    isMissingValues(req.journeyData.plan!, ['reasonForPlan']) ? '' : undefined,
  'intervention-details': (req: Request) => {
    const { success, isNew, index } = parseIdentifiedNeedIndex(req)

    if (!success) {
      if (!req.journeyData.plan?.reasonForPlan) {
        return ''
      }

      const correctIndex = (req.journeyData.plan?.identifiedNeeds?.length || 0) + 1

      if (!req.journeyData.plan?.identifiedNeedSubJourney || correctIndex !== index) {
        return '/identified-needs'
      }

      return `/summarise-identified-need/${correctIndex}`
    }

    const missing = isMissingValues(
      isNew ? req.journeyData.plan!.identifiedNeedSubJourney! : req.journeyData.plan!.identifiedNeeds![index]!,
      ['identifiedNeed'],
    )

    return missing ? `/summarise-identified-need/${req.url.split('/').pop()}` : undefined
  },
  'record-actions-progress': (req: Request) => {
    const { success, isNew, index } = parseIdentifiedNeedIndex(req)

    if (!success) {
      if (!req.journeyData.plan?.reasonForPlan) {
        return ''
      }

      const correctIndex = (req.journeyData.plan?.identifiedNeeds?.length || 0) + 1

      if (!req.journeyData.plan?.identifiedNeedSubJourney || correctIndex !== index) {
        return '/identified-needs'
      }

      return `/intervention-details/${correctIndex}`
    }

    const missing = isMissingValues(
      isNew ? req.journeyData.plan!.identifiedNeedSubJourney! : req.journeyData.plan!.identifiedNeeds![index]!,
      ['responsiblePerson'],
    )

    return missing ? `/intervention-details/${req.url.split('/').pop()}` : undefined
  },
  'check-answers': (req: Request) =>
    isMissingValues(req.journeyData.plan!, ['nextCaseReviewDate']) ? '/next-review-date' : undefined,
}
