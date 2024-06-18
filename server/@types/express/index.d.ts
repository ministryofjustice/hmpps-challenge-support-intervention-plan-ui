import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    journeyDataMap: Map<string, JourneyData>
  }
}

export type JourneyData = {
  prisoner?: PrisonerSummary
  logNumber?: string
  referral?: ReferralData
  saferCustodyScreening?: SaferCustodyScreening
  investigation?: Investigation
  plan?: Plan
}

export type PrisonerSummary = {
  prisonNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  prisonCode: string
  prisonName: string
  cellLocation: string
  status: string
}

type ReferralData = {
  isOnBehalfOfReferral?: boolean
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
      journeyData?: Omit<JourneyData, 'prisoner'>

      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: HmppsUser
    }
  }
}
