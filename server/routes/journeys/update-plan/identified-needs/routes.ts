import { UpdateIdentifiedNeedsController } from './controller'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateIdentifiedNeedsRoutes = (csipApiService: CsipApiService) => {
  const { router, get } = JourneyRouter()
  const controller = new UpdateIdentifiedNeedsController(csipApiService)

  get('/', controller.GET)

  return router
}
