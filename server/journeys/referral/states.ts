import { Request } from 'express'
import { JourneyState } from '../../middleware/stateValidationMiddleware'
import config from '../../config'

export const states: JourneyState[] = [
  {
    id: 0,
    path: config.serviceUrls.digitalPrison,
    getNext: (req: Request) => (req.journeyData.prisoner ? 10 : null),
  },
  {
    id: 10,
    path: 'on-behalf-of',
    getNext: (req: Request) => {
      switch (req.journeyData.referral?.isOnBehalfOfReferral) {
        case true:
          return 20
        case false:
          return 30
        default:
          return null
      }
    },
  },
  {
    id: 20,
    path: 'referrer',
    getNext: (req: Request) =>
      req.journeyData.referral?.referredBy && req.journeyData.referral.refererArea?.code ? 40 : null,
  },
  {
    id: 30,
    path: 'area-of-work',
    getNext: (req: Request) =>
      req.journeyData.referral?.referredBy && req.journeyData.referral.refererArea?.code ? 40 : null,
  },
  {
    id: 40,
    path: 'proactive-or-reactive',
    getNext: (_req: Request) => null,
  },
]
