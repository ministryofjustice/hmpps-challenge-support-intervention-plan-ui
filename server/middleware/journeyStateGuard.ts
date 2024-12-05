import type { NextFunction, Request, Response } from 'express'
import { validate } from 'uuid'

export enum ReviewOutcome {
  CLOSE_CSIP = 'CLOSE_CSIP',
  REMAIN_ON_CSIP = 'REMAIN_ON_CSIP',
}

export type JourneyStateGuard = { [pageName: string]: (req: Request) => string | undefined }

const parseIdentifiedNeedIndex = (req: Request) => {
  const match = req.url.match(/\/(\d+)(?:#[A-Za-z0-9-]+)?$/) || []
  const index = Number(match[1]) - 1
  return {
    success: !Number.isNaN(index) && (req.journeyData.plan!.identifiedNeeds || []).length >= index,
    isNew: (req.journeyData.plan!.identifiedNeeds || []).length === index,
    index,
  }
}

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
    'intervention-details': (req: Request) => {
      const { success, isNew, index } = parseIdentifiedNeedIndex(req)

      if (!success) {
        if (!req.journeyData.plan?.reasonForPlan) {
          return ''
        }

        if (!req.journeyData.plan?.identifiedNeedSubJourney) {
          // There's no sub journey present so the intent is not to create a new one
          return '/identified-needs'
        }

        // We can figure out if they're in the sub journey and what index they're editing
        return `/summarise-identified-need/${(req.journeyData.plan?.identifiedNeeds?.length || 0) + 1}`
      }

      const missing = isMissingValues(
        isNew ? req.journeyData.plan!.identifiedNeedSubJourney! : req.journeyData.plan!.identifiedNeeds![index]!,
        ['identifiedNeed'],
      )

      return missing ? `/summarise-identified-need/${req.url.split('/').pop()}` : undefined
    },
    'record-actions-progress': (req: Request) => {
      const { success, isNew, index } = parseIdentifiedNeedIndex(req)

      if (!success) {
        if (!req.journeyData.plan?.reasonForPlan) {
          return ''
        }

        if (!req.journeyData.plan?.identifiedNeedSubJourney) {
          // There's no sub journey present so the intent is not to create a new one
          return '/identified-needs'
        }

        // We can figure out if they're in the sub journey and what index they're editing
        return `/intervention-details/${(req.journeyData.plan?.identifiedNeeds?.length || 0) + 1}`
      }

      const missing = isMissingValues(
        isNew ? req.journeyData.plan!.identifiedNeedSubJourney! : req.journeyData.plan!.identifiedNeeds![index]!,
        ['responsiblePerson'],
      )

      return missing ? `/intervention-details/${req.url.split('/').pop()}` : undefined
    },
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
  return keys.some(key => obj?.[key] === undefined)
}

export default function journeyStateGuard() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const [, uuid, flow, page] = req.url.split('/')

    if (!uuid || !validate(uuid) || flow === 'csip-record' || req.url.endsWith('/start')) {
      // This page does not concern us
      return next()
    }

    if (!req.session.journeyDataMap?.[uuid!]?.stateGuard) {
      return next()
    }

    const journeyData = req.session.journeyDataMap?.[uuid]

    // All journeys need journeyData to be populated with prisoner data

    if (!req.session.journeyDataMap?.[uuid]?.prisoner) {
      // The relevant /start for this journey has not been visited
      // We don't have a CSIP record id so we can't automatically do this.
      return res.redirect(`/`)
    }

    if (!page || !flow) {
      return next()
    }

    let redirectTo
    let currentPage = page

    while (true) {
      if (currentPage === 'confirmation') {
        if (journeyData?.journeyCompleted) {
          return next()
        }

        currentPage = 'check-answers'
        redirectTo = '/check-answers'
      }

      const journeyState = journeyStates[flow]?.[currentPage]

      if (journeyState === undefined) {
        // We've backtracked all the way to a page that requires no validation
        if (page === currentPage) {
          return next()
        }
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }

      const targetRedirect = journeyState?.({
        ...req,
        journeyData,
        url: redirectTo ? `/${uuid}/${flow}${redirectTo}` : req.url,
      } as Request)

      if (targetRedirect !== undefined) {
        currentPage = targetRedirect.startsWith('/') ? targetRedirect.split('/')[1] || '' : targetRedirect
        redirectTo = targetRedirect
      }

      if (targetRedirect === undefined) {
        // We passed validation for this page, either redirect if we've had to backtrack or next() if not
        if (page === currentPage) {
          return next()
        }
        return res.redirect(`/${uuid}/${flow}${redirectTo}`)
      }
    }
  }
}
