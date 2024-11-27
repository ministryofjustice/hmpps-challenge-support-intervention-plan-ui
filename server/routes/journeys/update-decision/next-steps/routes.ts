import { UpdateNextStepsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from '../../record-decision/next-steps/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateNextStepsRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateNextStepsController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.checkSubmitToAPI, controller.POST)

  return router
}
