import type { NextFunction, Request, Response } from 'express'
import { validate } from 'uuid'

export enum ReviewOutcome {
  CLOSE_CSIP = 'CLOSE_CSIP',
  REMAIN_ON_CSIP = 'REMAIN_ON_CSIP',
}

export type JourneyStateGuard = { [pageName: string]: (req: Request) => string | undefined }

function redirectAreaOfWorkOrReferrer(req: Request, page: string) {
  const referral = req.journeyData.referral?.onBehalfOfSubJourney || req.journeyData.referral

  if (referral?.isOnBehalfOfReferral === false) {
    return page === 'area-of-work' ? undefined : '/area-of-work'
  }

  if (referral?.isOnBehalfOfReferral === true) {
    return page === 'referrer' ? undefined : '/referrer'
  }

  return '/on-behalf-of'
}

const journeyStates: { [journey: string]: JourneyStateGuard } = {
  screen: {
    'check-answers': (req: Request) =>
      isMissingValues(req.journeyData.saferCustodyScreening!, ['outcomeType', 'reasonForDecision']) ? '' : undefined,
  },
  referral: {
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
  },
  'develop-an-initial-plan': {
    'identified-needs': (req: Request) => (isMissingValues(req.journeyData.plan!, ['reasonForPlan']) ? '' : undefined),
    'next-review-date': (req: Request) =>
      isMissingValues(req.journeyData.plan!, ['identifiedNeeds']) ? '/record-actions-progress/1' : undefined,
    'summarise-identified-need': (req: Request) =>
      isMissingValues(req.journeyData.plan!, ['reasonForPlan']) ? '' : undefined,
    'intervention-details': (req: Request) =>
      isMissingValues(req.journeyData.plan!, ['identifiedNeedSubJourney'])
        ? `/summarise-identified-need/${req.url.split('/').pop()}`
        : undefined,
    'record-actions-progress': (req: Request) =>
      req.journeyData.plan!.identifiedNeedSubJourney?.intervention
        ? undefined
        : `/intervention-details/${req.url.split('/').pop()}`,
    'check-answers': (req: Request) =>
      isMissingValues(req.journeyData.plan!, ['nextCaseReviewDate']) ? '/next-review-date' : undefined,
  },
  'record-investigation': {
    'check-answers': (req: Request) =>
      isMissingValues(req.journeyData.investigation!, [
        'occurrenceReason',
        'personsTrigger',
        'personsUsualBehaviour',
        'evidenceSecured',
        'protectiveFactors',
        'staffInvolved',
        'interviews',
      ])
        ? ''
        : undefined,
  },
  'record-decision': {
    conclusion: (req: Request) =>
      isMissingValues(req.journeyData.decisionAndActions!, ['signedOffByRole']) ? '/' : undefined,
    'next-steps': (req: Request) =>
      isMissingValues(req.journeyData.decisionAndActions!, ['outcome', 'conclusion']) ? '/conclusion' : undefined,
    'additional-information': (req: Request) =>
      isMissingValues(req.journeyData.decisionAndActions!, ['outcome', 'conclusion']) ? '/conclusion' : undefined,
    'check-answers': (req: Request) =>
      isMissingValues(req.journeyData.decisionAndActions!, ['outcome', 'conclusion']) ? '/conclusion' : undefined,
  },
  'record-review': {
    'next-review-date': (req: Request) => {
      if (req.journeyData.review?.outcomeSubJourney?.outcome === ReviewOutcome.CLOSE_CSIP) {
        return '/close-csip'
      }

      if (req.journeyData.review?.outcome === ReviewOutcome.CLOSE_CSIP) {
        return '/check-answers'
      }

      if (!req.journeyData.review?.outcome && !req.journeyData.review?.outcomeSubJourney?.outcome) {
        return '/outcome'
      }
      return undefined
    },
    'close-csip': (req: Request) => {
      if (req.journeyData.review?.outcomeSubJourney?.outcome === ReviewOutcome.REMAIN_ON_CSIP) {
        return '/next-review-date'
      }

      if (req.journeyData.review?.outcome === ReviewOutcome.REMAIN_ON_CSIP) {
        return '/check-answers'
      }

      if (!req.journeyData.review?.outcome && !req.journeyData.review?.outcomeSubJourney?.outcome) {
        return '/outcome'
      }
      return undefined
    },
    'check-answers': (req: Request) => {
      if (req.journeyData.review?.outcomeSubJourney?.outcome === ReviewOutcome.CLOSE_CSIP) {
        return '/close-csip'
      }

      if (
        req.journeyData.review?.outcomeSubJourney?.outcome === ReviewOutcome.REMAIN_ON_CSIP &&
        !req.journeyData.review?.nextReviewDate
      ) {
        return '/next-review-date'
      }

      if (
        req.journeyData.review?.outcome !== ReviewOutcome.CLOSE_CSIP &&
        isMissingValues(req.journeyData.review!, ['attendees', 'nextReviewDate', 'outcome', 'summary'])
      ) {
        return ''
      }
      return undefined
    },
  },
}

export function isMissingValues<T>(obj: T, keys: Array<keyof T>): boolean {
  return keys.some(key => obj[key] === undefined)
}

export default function journeyStateGuard() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const [, uuid, flow, page] = req.url.split('/')

    if (!uuid || !validate(uuid) || flow === 'csip-record' || req.url.endsWith('/start')) {
      // This page does not concern us
      return next()
    }

    // All journeys need journeyData to be populated with prisoner data

    if (!req.session.journeyDataMap?.[uuid]?.prisoner) {
      // The relevant /start for this journey has not been visited
      // We don't have a CSIP record id so we can't automatically do this.
      return res.redirect(`/`)
    }

    if (!page || !flow) {
      return next()
    }

    if (page === 'confirmation') {
      if (req.journeyData.journeyCompleted) {
        return next()
      }
      return res.redirect(`check-answers`)
    }

    if (!journeyStates[flow]?.[page]) {
      // We haven't defined a guard for this page
      return next()
    }

    const journeyState = journeyStates[flow]?.[page]
    const journeyData = req.session.journeyDataMap[uuid]

    const targetRedirect = journeyState?.({ ...req, journeyData } as Request)

    if (typeof targetRedirect === 'string') {
      return res.redirect(`/${uuid}/${flow}${targetRedirect}`)
    }

    return next()
  }
}
