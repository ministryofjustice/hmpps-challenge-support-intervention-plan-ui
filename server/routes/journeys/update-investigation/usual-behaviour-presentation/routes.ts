import { UpdateUsualBehaviourController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from '../../record-investigation/usual-behaviour-presentation/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateUsualBehaviourRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateUsualBehaviourController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.checkSubmitToAPI, controller.POST)

  return router
}
