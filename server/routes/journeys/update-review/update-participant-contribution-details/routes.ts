import { UpdateAttendeeController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../record-review/participant-contribution-details/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateAttendeeRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateAttendeeController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
