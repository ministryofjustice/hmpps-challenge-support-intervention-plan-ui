import { DecisionAdditionalInformationController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const DecisionAdditionalInformationRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new DecisionAdditionalInformationController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
