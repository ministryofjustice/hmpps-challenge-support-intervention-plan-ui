import { StartJourneyController } from '../../start/controller'
import { Services } from '../../../../services'
import { JourneyRouter } from '../../base/routes'

export default function StartJourneyRoutes({ csipApiService, prisonerSearchService }: Services, redirectUrl: string) {
  const { router, get } = JourneyRouter()
  const controller = new StartJourneyController(csipApiService, prisonerSearchService)

  get('/', controller.redirectWithCsipData(redirectUrl))

  return router
}
