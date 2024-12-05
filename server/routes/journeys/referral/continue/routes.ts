import { Services } from '../../../../services'
import { JourneyRouter } from '../../base/routes'
import { ContinueJourneyController } from './controller'

export default function ContinueJourneyRoutes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new ContinueJourneyController(csipApiService, prisonerSearchService)

  get('/', controller.redirectWithCsipData('/referral/on-behalf-of'))

  return router
}
