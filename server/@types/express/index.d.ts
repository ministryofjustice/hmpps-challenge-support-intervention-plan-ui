import { HmppsUser } from '../../interfaces/hmppsUser'
import { Breadcrumbs } from '../../middleware/breadcrumbs'
import { fieldErrors } from '../../middleware/validationMiddleware'
import { CsipRecord, ReferenceData, YesNoAnswer } from '../csip/csipApiTypes'
import Prisoner from '../../services/prisonerSearch/prisoner'

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
  isCheckAnswers?: boolean
  prisoner?: PrisonerSummary
  logCode?: string
  referral?: ReferralData
  saferCustodyScreening?: SaferCustodyScreening
  investigation?: Investigation
  plan?: Plan
  csipRecord?: CsipRecord
  hasValidationErrors?: boolean
  journeyCompleted?: boolean
}

export type PrisonerSummary = Prisoner

type ReferralData = Partial<{
  onBehalfOfSubJourney: ReferralData
  isOnBehalfOfReferral: boolean
  referredBy: string
  refererArea: ReferenceData
  isProactiveReferral: boolean
  incidentLocation: ReferenceData
  incidentType: ReferenceData
  incidentDate: string
  incidentTime: string | null
  descriptionOfConcern: string
  knownReasons: string
  contributoryFactors: ContributoryFactor[]
  isSaferCustodyTeamInformed: YesNoAnswer
  otherInformation: string | null
  incidentInvolvement: ReferenceData
  staffAssaulted: boolean
  assaultedStaffName: string | null
}>

export type ContributoryFactor = {
  factorType: ReferenceData
  comment?: string
}

type SaferCustodyScreening = Partial<{
  outcomeType: ReferenceData
  reasonForDecision: string
}>

type Investigation = Partial<{
  interviewsSubJourney: Interview
  interviews: Interview[]
  staffInvolved: string
  evidenceSecured: string
  occurrenceReason: string
  personsUsualBehaviour: string
  personsTrigger: string
  protectiveFactors: string
}>

type Interview = Partial<{
  interviewee: string
  interviewDate: string
  intervieweeRole: ReferenceData
  interviewText: string
}>

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
      digitalPrisonServicesUrl: string
      breadcrumbs: Breadcrumbs
      prisoner?: PrisonerSummary
      formResponses?: { [key: string]: string }
    }
  }
}
