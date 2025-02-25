import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { ChangeDecisionController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import CheckChangeDecisionRoutes from '../check-change-decision/routes'
import { NextStepsRoutes } from './next-steps/routes'
import { ConclusionRoutes } from './conclusion/routes'
import { CheckAnswersRoutes } from './check-answers/routes'
import { AdditionalInformationRoutes } from './additional-information/routes'
import { schemaFactory } from '../record-decision/schemas'
import { CsipRecord } from '../../../@types/csip/csipApiTypes'

function Routes(services: Services) {
  const { router, get, post } = JourneyRouter()
  const controller = new ChangeDecisionController(services.csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(services.csipApiService)), controller.POST)

  router.use('/next-steps', NextStepsRoutes())
  router.use('/conclusion', ConclusionRoutes(services.csipApiService))
  router.use('/additional-information', AdditionalInformationRoutes())
  router.use('/check-answers', CheckAnswersRoutes(services.csipApiService, services.auditService))

  return router
}

export const ChangeDecisionRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use(path, Routes(services))
  router.use('/check-change-decision', CheckChangeDecisionRoutes())

  return router
}

export function shouldAllowChangeDecision(csipRecord: CsipRecord) {
  const csipRecordCode = csipRecord.status.code
  const currentDecisionOutcome = csipRecord.referral?.decisionAndActions?.outcome?.code

  if (csipRecordCode === 'PLAN_PENDING' && currentDecisionOutcome === 'CUR') {
    return true
  }

  return false
}
