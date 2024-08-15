import { EvidenceSecuredController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const EvidenceSecuredRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new EvidenceSecuredController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
