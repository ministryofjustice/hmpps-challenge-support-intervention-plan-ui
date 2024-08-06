import { InvolvementController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const InvolvementRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const referralOnBehalfOfController = new InvolvementController(csipApiService)

  get('/', referralOnBehalfOfController.GET)
  post('/', validate(schemaFactory(csipApiService)), referralOnBehalfOfController.POST)

  return router
}
