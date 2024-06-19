import { HmppsUser } from '../../interfaces/hmppsUser'

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
