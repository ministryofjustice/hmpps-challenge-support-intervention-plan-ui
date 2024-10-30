import { components, operations } from './index'

export type ReferenceData = components['schemas']['ReferenceData']
export type ReferenceDataType = operations['getReferenceData']['parameters']['path']['domain']

export type YesNoAnswer = components['schemas']['CreateReferralRequest']['isSaferCustodyTeamInformed']
export type CsipRecord = components['schemas']['CsipRecord']
export type CsipRecordStatus =
  | 'CSIP_CLOSED'
  | 'CSIP_OPEN'
  | 'AWAITING_DECISION'
  | 'ACCT_SUPPORT'
  | 'PLAN_PENDING'
  | 'INVESTIGATION_PENDING'
  | 'NO_FURTHER_ACTION'
  | 'SUPPORT_OUTSIDE_CSIP'
  | 'REFERRAL_SUBMITTED'
  | 'REFERRAL_PENDING'
  | 'UNKNOWN'

export type CsipSearchResults = components['schemas']['CsipSearchResults']
