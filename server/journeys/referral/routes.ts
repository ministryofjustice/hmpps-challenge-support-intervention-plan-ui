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
import { ReferralAdditionalInformationRoutes } from './additional-information/routes'

function Routes(csipApiService: CsipApiService): Router {
  const router = Router({ mergeParams: true })

  router.use('/on-behalf-of', OnBehalfOfRoutes())
  router.use('/area-of-work', ReferralAreaOfWorkRoutes(csipApiService))
  router.use('/referrer', ReferralReferrerRoutes(csipApiService))
  router.use('/proactive-or-reactive', ReferralProactiveOrReactiveRoutes())
  router.use('/details', ReferralDetailsRoutes(csipApiService))
  router.use('/description', ReferralDescriptionRoutes())
  router.use('/reasons', ReferralReasonsRoutes())
  router.use('/additional-information', ReferralAdditionalInformationRoutes())

  return router
}

export default function routes(csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService): Router {
  const router = Router({ mergeParams: true })

  router.use('/', StartJourneyRoutes(prisonerSearchService))
  router.use('/referral', Routes(csipApiService))

  return router
}
