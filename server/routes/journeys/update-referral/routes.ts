import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateReferralController } from './controller'
import { UpdateInvolvementRoutes } from './involvement/routes'
import { UpdateProactiveOrReactiveRoutes } from './proactive-or-reactive/routes'
import { UpdateReferralDetailsRoutes } from './details/routes'
import { ReferralContributoryFactorCommentRoutes } from '../referral/contributory-factor-comment/routes'
import { UpdateSaferCustodyRoutes } from './safer-custody/routes'
import { UpdateReferrerRoutes } from './referrer/routes'
import { UpdateDescriptionRoutes } from './description/routes'
import { UpdateReasonsRoutes } from './reasons/routes'

function Routes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateReferralController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/involvement', UpdateInvolvementRoutes(csipApiService))
  router.use('/proactive-or-reactive', UpdateProactiveOrReactiveRoutes(csipApiService))
  router.use('/details', UpdateReferralDetailsRoutes(csipApiService))
  router.use('/:factorUuid-comment', ReferralContributoryFactorCommentRoutes())
  router.use('/safer-custody', UpdateSaferCustodyRoutes(csipApiService))
  router.use('/referrer', UpdateReferrerRoutes(csipApiService))
  router.use('/description', UpdateDescriptionRoutes(csipApiService))
  router.use('/reasons', UpdateReasonsRoutes(csipApiService))

  return router
}

export const UpdateReferralRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-referral/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
