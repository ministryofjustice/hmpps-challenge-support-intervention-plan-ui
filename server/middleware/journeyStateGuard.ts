import type { NextFunction, Request, Response } from 'express'
import { validate } from 'uuid'

const journeyStates: Record<string, Record<string, { guard?: (req: Request) => boolean, keys: Record<string, string[]>, previousPage: string | ((req: Request) => string) }>> = {
  'screen': {
    'check-answers': {
      keys: { 'saferCustodyScreening': ['outcomeType', 'reasonForDecision'] },
      previousPage: ''
    },
  },
  'referral': {
    'area-of-work': {
      keys: { 'referral': ['onBehalfOfSubJourney'] },
      previousPage: '/on-behalf-of'
    },
    'referrer': {
      keys: { 'referral': ['onBehalfOfSubJourney'] },
      previousPage: '/on-behalf-of'
    },
    'proactive-or-reactive': {
      keys: { 'referral': ['refererArea'] },
      previousPage: (req: Request) => req.journeyData.referral!.onBehalfOfSubJourney?.isOnBehalfOfReferral ? '/referrer' : '/area-of-work'
    },
    'details': {
      keys: { 'referral': ['isProactiveReferral'] },
      previousPage: '/proactive-or-reactive'
    },
    'involvement': {
      keys: { 'referral': ['incidentLocation', 'incidentType', 'incidentDate'] },
      previousPage: '/details'
    },
    'description': {
      keys: { 'referral': ['incidentInvolvement', 'isStaffAssaulted'] },
      previousPage: '/involvement'
    },
    'reasons': {
      keys: { 'referral': ['descriptionOfConcern'] },
      previousPage: '/description'
    },
    'contributory-factors': {
      keys: { 'referral': ['knownReasons'] },
      previousPage: '/reasons'
    },
    'contributory-factors-comments': {
      keys: { 'referral': ['contributoryFactors'] },
      previousPage: '/contributory-factors'
    },
    'safer-custody': {
      keys: { 'referral': ['contributoryFactors'] },
      previousPage: '/contributory-factors'
    },
    'additional-information': {
      keys: { 'referral': ['isSaferCustodyTeamInformed'] },
      previousPage: '/safer-custody'
    },
    'check-answers': {
      keys: { 'referral': ['isSaferCustodyTeamInformed'] },
      previousPage: '/safer-custody'
    }
  },
  'develop-an-initial-plan': {
    'identified-needs': {
      keys: { 'plan': ['reasonForPlan'] },
      previousPage: ''
    },
    'next-review-date': {
      keys: { 'plan': ['identifiedNeeds'] },
      previousPage: '/record-actions-progress/1'
    },
    'summarise-identified-need': {
      keys: { 'plan': ['reasonForPlan'] },
      previousPage: ''
    },
    'intervention-details': {
      keys: { 'plan': ['identifiedNeedSubJourney'] },
      previousPage: (req: Request) => `/summarise-identified-need/${req.url.split('/').pop()}`
    },
    'record-actions-progress': {
      keys: { 'plan': ['identifiedNeedSubJourney'] },
      guard: (req: Request) => {
        return !!req.journeyData.plan!.identifiedNeedSubJourney?.intervention
      },
      previousPage: (req: Request) => `/intervention-details/${req.url.split('/').pop()}`
    },
    'check-answers': {
      keys: { 'plan': ['nextCaseReviewDate'] },
      previousPage: '/next-review-date'
    },
  },
  'record-investigation': {
    'check-answers': {
      keys: { 'investigation': ['occurrenceReason', 'personsTrigger', 'personsUsualBehaviour', 'evidenceSecured', 'protectiveFactors', 'staffInvolved', 'interviews'] },
      previousPage: ''
    },
  },
  'record-decision': {
    'conclusion': {
      keys: { 'decisionAndActions': ['signedOffByRole'] },
      previousPage: ''
    },
    'next-steps': {
      keys: { 'decisionAndActions': ['outcome', 'conclusion'] },
      previousPage: '/conclusion'
    },
    'additional-information': {
      keys: { 'decisionAndActions': ['outcome', 'conclusion'] },
      previousPage: '/conclusion'
    },
    'check-answers': {
      keys: { 'decisionAndActions': ['outcome', 'conclusion'] },
      previousPage: '/conclusion'
    },
  },
  'record-review': {
    'next-review-date': {
      keys: { 'review': ['outcomeSubJourney'] },
      guard: (req) => req.journeyData.review?.outcomeSubJourney?.outcome === 'REMAIN_ON_CSIP',
      previousPage: '/outcome'
    },
    'close-csip': {
      keys: { 'review': ['outcomeSubJourney'] },
      guard: (req) => req.journeyData.review?.outcomeSubJourney?.outcome === 'CLOSE_CSIP',
      previousPage: '/outcome'
    },
    'check-answers': {
      keys: { 'review': [] },
      guard: (req) => {
        if ((req.journeyData.review?.outcomeSubJourney || req.journeyData.review)!.outcome === 'CLOSE_CSIP') {
          return true
        }

        return !(['attendees', 'summary', 'nextReviewDate', 'outcome']).some(subkey => {
          return req.journeyData.review?.[subkey] === undefined
        })
      },
      previousPage: (req) => {
        if (req.journeyData.review?.outcomeSubJourney?.outcome && !req.journeyData.review?.nextReviewDate) {
          return '/next-review-date'
        }

        return ''
      }
    },
  }
}

export default function journeyStateGuard() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const [_, uuid, flow, page] = req.url.split('/')

    if (!uuid || !validate(uuid) || flow === 'csip-record' || req.url.endsWith('/start')) {
      // This page does not concern us
      return next()
    }

    // All journeys need journeyData to be populated with prisoner data

    if (!req.session.journeyDataMap?.[uuid]?.prisoner) {
      // The relevant /start for this journey has not been visited. We should redirect to it.
      // We don't have a csip record id? so we must redirect to home instead
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

    if (!journeyStates[flow!]?.[page]) {
      // We haven't defined any required keys for this page
      return next()
    }

    const journeyState = journeyStates[flow!]?.[page]
    const journeyData = req.session.journeyDataMap[uuid]

    for (const key of Object.keys(journeyState?.keys || {})) {
      const missingKeys = (journeyState?.keys[key] || []).filter(subkey => {
        return journeyData?.[key]?.[subkey] === undefined
      })

      if (missingKeys.length > 0 || journeyState?.guard && !journeyState.guard({ ...req, journeyData } as Request)) {
        if (typeof (journeyState?.previousPage) === 'string') {
          return res.redirect(`/${uuid}/${flow}${journeyState?.previousPage}`)
        }
        else {
          return res.redirect(`/${uuid}/${flow}${journeyState?.previousPage({ ...req, journeyData } as Request)}`)
        }
      }
    }

    return next()
  }
}
