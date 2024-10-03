import { CsipRecordController } from './controller'
import { JourneyRouter } from '../journeys/base/routes'
import type { Services } from '../../services'
import { UpdateReferralController } from '../journeys/update-referral/controller'

export const CsipRecordRoutes = ({ csipApiService, prisonerSearchService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new CsipRecordController(csipApiService, prisonerSearchService)
  const updateReferralController = new UpdateReferralController(csipApiService, prisonerSearchService)

  get('/', controller.GET_BASE)
  get('/referral', controller.GET)
  get('/investigation', controller.GET)
  get('/plan', controller.GET)
  get('/reviews', controller.GET)
  post('/', controller.POST)
  get('/update-referral', updateReferralController.UPDATE)

  return router
}
