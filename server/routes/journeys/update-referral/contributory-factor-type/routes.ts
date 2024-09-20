import { UpdateContributoryFactorsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import { schemaFactory } from './schemas'

export const UpdateContributoryFactorsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateContributoryFactorsController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.checkSubmitToAPI, controller.POST)

  return router
}
