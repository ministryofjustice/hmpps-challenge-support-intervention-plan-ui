import { UpdateAdditionalInfoController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import { schemaFactory } from './schemas'
import AuditService from '../../../../services/auditService'

export const UpdateAdditionalInfoRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateAdditionalInfoController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.checkSubmitToAPI, controller.POST)

  return router
}
