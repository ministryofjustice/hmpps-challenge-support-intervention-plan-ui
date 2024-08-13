import { InterviewDetailsController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../services/csipApi/csipApiService'

export const InterviewDetailsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new InterviewDetailsController(csipApiService)

  get('/:index', controller.GET)
  post('/:index', validate(schemaFactory(csipApiService)), controller.POST)

  return router
}
