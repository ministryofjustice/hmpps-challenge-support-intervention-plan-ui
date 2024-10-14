import { ParticipantsSummaryController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const ParticipantsSummaryRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ParticipantsSummaryController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
