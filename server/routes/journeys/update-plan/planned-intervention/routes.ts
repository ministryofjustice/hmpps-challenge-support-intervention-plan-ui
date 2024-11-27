import { UpdatePlannedInterventionController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdatePlannedInterventionRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdatePlannedInterventionController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.checkSubmitToAPI, controller.POST)

  return router
}
