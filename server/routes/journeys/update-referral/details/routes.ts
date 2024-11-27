import { UpdateReferralDetailsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from '../../referral/details/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateReferralDetailsRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateReferralDetailsController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.checkSubmitToAPI, controller.POST)

  return router
}
