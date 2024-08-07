import { ReferralContributoryFactorCommentController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ReferralContributoryFactorCommentRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralContributoryFactorCommentController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
