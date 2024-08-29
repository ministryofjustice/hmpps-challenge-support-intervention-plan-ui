import { CsipRecordController } from './controller'
import { JourneyRouter } from '../journeys/base/routes'
import type { Services } from '../../services'

export const CsipRecordRoutes = ({ csipApiService, prisonerSearchService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new CsipRecordController(csipApiService, prisonerSearchService)

  get('/', controller.GET_BASE)
  get('/referral', controller.GET)
  get('/investigation', controller.GET)
  post('/', controller.POST)

  return router
}
