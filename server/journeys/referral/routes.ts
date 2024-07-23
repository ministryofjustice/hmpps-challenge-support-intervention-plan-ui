import { Router } from 'express'
import { OnBehalfOfRoutes } from './on-behalf-of/routes'
import CsipApiService from '../../services/csipApi/csipApiService'
import { ReferralAreaOfWorkRoutes } from './area-of-work/routes'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import StartJourneyRoutes from './start/routes'
import { ReferralReferrerRoutes } from './referrer/routes'
import { ReferralProactiveOrReactiveRoutes } from './proactive-or-reactive/routes'
import { ReferralDetailsRoutes } from './details/routes'
import { ReferralDescriptionRoutes } from './description/routes'
import { ReferralReasonsRoutes } from './reasons/routes'
import { ReferralContributoryFactorsRoutes } from './contributory-factors/routes'
import { ReferralContributoryFactorsCommentsRoutes } from './contributory-factors-comments/routes'
import { ReferralContributoryFactorCommentRoutes } from './contributory-factor-comment/routes'
import { ReferralSaferCustodyRoutes } from './safer-custody/routes'
import { ReferralAdditionalInformationRoutes } from './additional-information/routes'
import { InvolvementRoutes } from './involvement/routes'
import { ReferralCheckAnswersRoutes } from './check-answers/routes'
import { ConfirmationRoutes } from './confirmation/routes'

function Routes(csipApiService: CsipApiService): Router {
  const router = Router({ mergeParams: true })

  router.use('/on-behalf-of', OnBehalfOfRoutes())
  router.use('/area-of-work', ReferralAreaOfWorkRoutes(csipApiService))
  router.use('/referrer', ReferralReferrerRoutes(csipApiService))
  router.use('/proactive-or-reactive', ReferralProactiveOrReactiveRoutes())
  router.use('/details', ReferralDetailsRoutes(csipApiService))
  router.use('/description', ReferralDescriptionRoutes())
  router.use('/reasons', ReferralReasonsRoutes())
  router.use('/contributory-factors', ReferralContributoryFactorsRoutes(csipApiService))
  router.use('/contributory-factors-comments', ReferralContributoryFactorsCommentsRoutes())
  router.use('/:factorTypeCode-comment', ReferralContributoryFactorCommentRoutes())
  router.use('/safer-custody', ReferralSaferCustodyRoutes())
  router.use('/additional-information', ReferralAdditionalInformationRoutes())
  router.use('/involvement', InvolvementRoutes(csipApiService))
  router.use('/check-answers', ReferralCheckAnswersRoutes(csipApiService))
  router.use('/confirmation', ConfirmationRoutes())

  return router
}

export default function routes(csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  router.use('/', StartJourneyRoutes(prisonerSearchService))
  router.use('/referral', Routes(csipApiService))

  return router
}
