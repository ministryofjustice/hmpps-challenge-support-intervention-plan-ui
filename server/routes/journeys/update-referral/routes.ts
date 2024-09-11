import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateReferralController } from './controller'
import { UpdateInvolvementRoutes } from './involvement/routes'
import { UpdateProactiveOrReactiveRoutes } from './proactive-or-reactive/routes'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateReferralController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/involvement', UpdateInvolvementRoutes(csipApiService))
  router.use('/proactive-or-reactive', UpdateProactiveOrReactiveRoutes(csipApiService))

  return router
}

export const UpdateReferralRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-referral/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
