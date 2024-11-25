import { HmppsUser } from '../../interfaces/hmppsUser'
import { Breadcrumbs } from '../../middleware/breadcrumbs'
import { fieldErrors } from '../../middleware/validationMiddleware'
import { CsipRecord, CsipRecordStatus, ReferenceData, YesNoAnswer } from '../csip/csipApiTypes'
import Prisoner from '../../services/prisonerSearch/prisoner'
import { CaseLoad } from '../../interfaces/caseLoad'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    journeyDataMap: JourneyDataMap
    searchCsipParams: SearchCsipParams
  }
}

type JourneyDataMap = {
  [key: string]: JourneyData
}

type SearchCsipParams = Partial<{
  query: string | null
  status: CsipRecordStatus | null
  sort: string
  page: number
}>

export type JourneyData = {
  instanceUnixEpoch: number
  isCheckAnswers?: boolean
  prisoner?: PrisonerSummary
  logCode?: string
  referral?: ReferralData
  saferCustodyScreening?: SaferCustodyScreening
  investigation?: Investigation
  decisionAndActions?: DecisionAndActions
  plan?: Plan
  csipRecord?: CsipRecord
  hasValidationErrors?: boolean
  journeyCompleted?: boolean
  isUpdate?: boolean
  review?: Review
}

export type PrisonerSummary = Prisoner

type ReferralData = Partial<{
  onBehalfOfSubJourney: ReferralData
  contributoryFactorSubJourney: Partial<ContributoryFactor>
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
  isStaffAssaulted: boolean
  assaultedStaffName: string | null
}>

export type ContributoryFactor = {
  factorType: ReferenceData
  factorUuid?: string // This is optional because when we're creating a referral, we don't have these uuids yet, but we do on edit
  comment?: string
}

type SaferCustodyScreening = Partial<{
  outcomeType: ReferenceData
  reasonForDecision: string
}>

type Investigation = Partial<{
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
  interviewText: string | null
}> & {
  interviewUuid?: string
}

type DecisionAndActions = Partial<{
  signedOffByRole: ReferenceData
  outcome: ReferenceData
  conclusion: string
  nextSteps: string | null
  actionOther: string | null
}>

export type Plan = Partial<{
  identifiedNeedSubJourney: Partial<IdentifiedNeed>
  isCaseManager: boolean
  caseManager: string
  reasonForPlan: string
  nextCaseReviewDate: string
  identifiedNeeds: IdentifiedNeed[]
  isComplete: boolean
  reviews: Review[]
}>

export type IdentifiedNeed = {
  identifiedNeed: string
  responsiblePerson: string
  createdDate: string
  targetDate: string
  closedDate: string | null
  intervention: string
  progression: string | null
  identifiedNeedUuid?: string // only exist in Update journey
}

export type Review = Partial<{
  outcomeSubJourney: Review
  reviewUuid: string
  reviewSequence: number
  reviewDate: string
  nextReviewDate: string
  csipClosedDate: string
  summary: string
  // actions array in backend
  outcome: string
  attendees: Attendee[]
  attendeesSubJourney: Partial<Attendee>
}>

export type Attendee = Partial<{
  attendeeUuid: string
  name: string
  role: string
  isAttended: boolean
  contribution: string
}>

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

    interface Response {
      notFound(): void
    }

    interface Locals {
      user: HmppsUser
      validationErrors?: fieldErrors
      digitalPrisonServicesUrl: string
      breadcrumbs: Breadcrumbs
      auditEvent: {
        pageNameSuffix: string
        who: string
        subjectId?: string
        subjectType?: string
        correlationId?: string
        details?: Record<string, unknown>
      }
      prisoner?: PrisonerSummary
      feComponentsMeta?: {
        activeCaseLoad: CaseLoad
        caseLoads: CaseLoad[]
        services: {
          id: string
          heading: string
          description: string
          href: string
          navEnabled: boolean
        }[]
      }
      formResponses?: { [key: string]: string }
      appInsightsConnectionString?: string
      appInsightsApplicationName?: string
      buildNumber?: string
      asset_path: string
      applicationName: string
      environmentName: string
      environmentNameColour: string
    }
  }
}
