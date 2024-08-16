import { DecisionAdditionalInformationController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const DecisionAdditionalInformationRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new DecisionAdditionalInformationController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
