import { UpdateSaferCustodyController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../referral/safer-custody/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateSaferCustodyRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateSaferCustodyController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
