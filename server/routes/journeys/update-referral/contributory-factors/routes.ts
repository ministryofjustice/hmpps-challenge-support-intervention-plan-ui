import { UpdateContributoryFactorsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from '../../referral/contributory-factors/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateContributoryFactorsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateContributoryFactorsController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.checkSubmitToAPI, controller.POST)

  return router
}
