import { InvestigationCheckAnswersController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const InvestigationCheckAnswersRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new InvestigationCheckAnswersController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
