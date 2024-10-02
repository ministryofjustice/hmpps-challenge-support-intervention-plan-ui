import { CaseManagementController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../../../services/prisonerSearch/prisonerSearchService'

export const CaseManagementRoutes = (csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new CaseManagementController(csipApiService, prisonerSearchService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
