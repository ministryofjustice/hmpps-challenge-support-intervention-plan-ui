import { StaffInvolvedController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const StaffInvolvedRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new StaffInvolvedController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
