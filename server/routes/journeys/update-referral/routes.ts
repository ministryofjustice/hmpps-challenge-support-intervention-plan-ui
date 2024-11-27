import StartJourneyRoutes from './start/routes'
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import { UpdateReferralController } from './controller'
import { UpdateInvolvementRoutes } from './involvement/routes'
import { UpdateProactiveOrReactiveRoutes } from './proactive-or-reactive/routes'
import { UpdateReferralDetailsRoutes } from './details/routes'
import { UpdateSaferCustodyRoutes } from './safer-custody/routes'
import { UpdateReferrerRoutes } from './referrer/routes'
import { AddContributoryFactorRoutes } from './add-contributory-factor/routes'
import { NewContributoryFactorCommentRoutes } from './new-contributory-factor-comment/routes'
import { UpdateDescriptionRoutes } from './description/routes'
import { UpdateContributoryFactorsRoutes } from './contributory-factor-type/routes'
import { UpdateReasonsRoutes } from './reasons/routes'
import { UpdateAdditionalInfoRoutes } from './additional-information/routes'
import { UpdateContributoryFactorsCommentRoutes } from './contributory-factor-comment/routes'

function Routes({ csipApiService, prisonerSearchService, auditService }: Services) {
  const { router, get } = JourneyRouter()
  const updateController = new UpdateReferralController(csipApiService, prisonerSearchService)

  get('/', updateController.UPDATE)

  router.use('/involvement', UpdateInvolvementRoutes(csipApiService, auditService))
  router.use('/proactive-or-reactive', UpdateProactiveOrReactiveRoutes(csipApiService, auditService))
  router.use('/details', UpdateReferralDetailsRoutes(csipApiService, auditService))
  router.use('/new-:factorTypeCode-comment', NewContributoryFactorCommentRoutes(csipApiService, auditService))
  router.use('/safer-custody', UpdateSaferCustodyRoutes(csipApiService, auditService))
  router.use('/referrer', UpdateReferrerRoutes(csipApiService, auditService))
  router.use('/add-contributory-factor', AddContributoryFactorRoutes(csipApiService))
  router.use('/description', UpdateDescriptionRoutes(csipApiService, auditService))
  router.use('/:factorUuid-comment', UpdateContributoryFactorsCommentRoutes(csipApiService, auditService))
  router.use('/:factorUuid-type', UpdateContributoryFactorsRoutes(csipApiService, auditService))
  router.use('/reasons', UpdateReasonsRoutes(csipApiService, auditService))
  router.use('/additional-information', UpdateAdditionalInfoRoutes(csipApiService, auditService))

  return router
}

export const UpdateReferralRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/csip-record/:csipRecordId/update-referral/start', StartJourneyRoutes(services))
  router.use(path, Routes(services))

  return router
}
