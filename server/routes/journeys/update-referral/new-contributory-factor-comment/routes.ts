import { NewContributoryFactorCommentController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../referral/contributory-factor-comment/schemas'
import { JourneyRouter } from '../../base/routes'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export const NewContributoryFactorCommentRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new NewContributoryFactorCommentController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
