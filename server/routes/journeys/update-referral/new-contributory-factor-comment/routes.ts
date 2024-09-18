import { NewContributoryFactorCommentController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../referral/contributory-factor-comment/schemas'
import { JourneyRouter } from '../../base/routes'
import type CsipApiService from '../../../../services/csipApi/csipApiService'

export const NewContributoryFactorCommentRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new NewContributoryFactorCommentController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
