import { UpdateContributoryFactorsCommentController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import { schemaFactory } from './schemas'

export const UpdateContributoryFactorsCommentRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateContributoryFactorsCommentController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.checkSubmitToAPI, controller.POST)

  return router
}
