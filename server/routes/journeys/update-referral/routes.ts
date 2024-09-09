import StartJourneyRoutes from './start/routes'

import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { UpdateReferralController } from './controller'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import { UpdateInvolvementRoutes } from './involvement/routes'

const UpdateRoutes = (csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService) => {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateReferralController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/involvement', UpdateInvolvementRoutes(csipApiService))

  return router
}

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router } = JourneyRouter()

  router.use('/', UpdateRoutes(csipApiService, prisonerSearchService))

  return router
}

export const UpdateReferralRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-referral/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
