import { StartJourneyController } from '../../start/controller'
import { Services } from '../../../services'
import { JourneyRouter } from '../../base/routes'

export default function StartJourneyRoutes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new StartJourneyController(csipApiService, prisonerSearchService)

  get('/', controller.redirectWithCsipData('/record-investigation'))

  return router
}
