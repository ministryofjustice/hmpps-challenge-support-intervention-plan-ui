import { InterviewsSummaryController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const InterviewsSummaryRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new InterviewsSummaryController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
