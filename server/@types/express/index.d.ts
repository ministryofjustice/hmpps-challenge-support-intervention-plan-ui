import { HmppsUser } from '../../interfaces/hmppsUser'
import { fieldErrors } from '../../middleware/validationMiddleware'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    journeyDataMap: JourneyDataMap
  }
}

type JourneyDataMap = {
  [key: string]: JourneyData
}

export type JourneyData = {
  instanceUnixEpoch: number
  prisoner?: PrisonerSummary
  logNumber?: string
  referral?: ReferralData
  saferCustodyScreening?: SaferCustodyScreening
  investigation?: Investigation
  plan?: Plan
}

export type PrisonerSummary = {
  prisonerNumber: string
  firstName: string
  lastName: string
  cellLocation: string
}

type ReferralData = {
  isOnBehalfOfReferral?: boolean
  areaOfWorkCode?: string
}

type SaferCustodyScreening = object

type Investigation = object

type Plan = object

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      journeyData: JourneyData

      logout(done: (err: unknown) => void): void
      systemClientToken: string
    }

    interface Locals {
      user: HmppsUser
      validationErrors?: fieldErrors
    }
  }
}
