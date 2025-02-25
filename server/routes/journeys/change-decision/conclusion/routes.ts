import { ConclusionController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import { schemaFactory } from '../../record-decision/conclusion/schemas'

export const ConclusionRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ConclusionController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.POST)

  return router
}
