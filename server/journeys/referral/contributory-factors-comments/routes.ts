import { ReferralContributoryFactorsCommentsController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const ReferralContributoryFactorsCommentsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralContributoryFactorsCommentsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
