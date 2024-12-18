import { Request } from 'express'
import { OnBehalfOfRoutes } from './on-behalf-of/routes'
import { ReferralAreaOfWorkRoutes } from './area-of-work/routes'
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
import { Services } from '../../../services'
import { JourneyRouter } from '../base/routes'
import ContinueJourneyRoutes from './continue/routes'
import journeyStateGuard, { isMissingValues } from '../../../middleware/journeyStateGuard'

function Routes({ csipApiService, auditService }: Services) {
  const { router } = JourneyRouter()

  router.use('/on-behalf-of', OnBehalfOfRoutes(csipApiService))
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
  router.use('/check-answers', ReferralCheckAnswersRoutes(csipApiService, auditService))
  router.use('/confirmation', ConfirmationRoutes())

  return router
}

export const ReferralRoutes = ({ services, path }: { services: Services; path: string }) => {
  const { router } = JourneyRouter()

  router.use('/prisoners/:prisonerNumber/referral/start', StartJourneyRoutes(services))
  router.use('/csip-record/:csipRecordId/referral/start', ContinueJourneyRoutes(services))
  router.use(path, journeyStateGuard(guard, services.appInsightsClient))
  router.use(path, Routes(services))

  return router
}

const redirectAreaOfWorkOrReferrer = (req: Request, page: string) => {
  const referral = req.journeyData.referral?.onBehalfOfSubJourney || req.journeyData.referral

  if (referral?.isOnBehalfOfReferral === false) {
    return page === 'area-of-work' ? undefined : '/area-of-work'
  }

  if (referral?.isOnBehalfOfReferral === true) {
    return page === 'referrer' ? undefined : '/referrer'
  }

  return '/on-behalf-of'
}

const guard = {
  'area-of-work': (req: Request) => redirectAreaOfWorkOrReferrer(req, 'area-of-work'),
  referrer: (req: Request) => redirectAreaOfWorkOrReferrer(req, 'referrer'),
  'proactive-or-reactive': (req: Request) => {
    if (isMissingValues(req.journeyData.referral!, ['refererArea'])) {
      return req.journeyData.referral!.onBehalfOfSubJourney?.isOnBehalfOfReferral ? '/referrer' : '/area-of-work'
    }
    return undefined
  },
  details: (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['isProactiveReferral']) ? '/proactive-or-reactive' : undefined,
  involvement: (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['incidentLocation', 'incidentType', 'incidentDate'])
      ? '/details'
      : undefined,
  description: (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['incidentInvolvement', 'isStaffAssaulted'])
      ? '/involvement'
      : undefined,
  reasons: (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['descriptionOfConcern']) ? '/description' : undefined,
  'contributory-factors': (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['knownReasons']) ? '/reasons' : undefined,
  'contributory-factors-comments': (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['contributoryFactors']) ? '/contributory-factors' : undefined,
  'safer-custody': (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['contributoryFactors']) ? '/contributory-factors' : undefined,
  'additional-information': (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['isSaferCustodyTeamInformed']) ? '/safer-custody' : undefined,
  'check-answers': (req: Request) =>
    isMissingValues(req.journeyData.referral!, ['isSaferCustodyTeamInformed']) ? '/safer-custody' : undefined,
}
