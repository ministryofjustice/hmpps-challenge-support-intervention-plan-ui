import { components, operations } from './index'

export type ReferenceData = components['schemas']['ReferenceData']
export type ReferenceDataType = operations['getReferenceData']['parameters']['path']['domain']

export type YesNoAnswer = components['schemas']['CreateReferralRequest']['isSaferCustodyTeamInformed']
export type CsipRecord = components['schemas']['CsipRecord']
