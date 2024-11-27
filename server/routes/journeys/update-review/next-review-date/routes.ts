import { UpdateNextReviewDateController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../record-review/next-review-date/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateNextReviewDateRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateNextReviewDateController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
