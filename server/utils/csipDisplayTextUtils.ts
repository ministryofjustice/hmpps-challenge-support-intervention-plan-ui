import { CsipRecord } from '../@types/csip/csipApiTypes'

export const csipStatusDisplayText = (csipRecord: CsipRecord) => {
  switch (csipRecord.status) {
    case 'ACCT_SUPPORT':
      return 'Support through ACCT'
    case 'AWAITING_DECISION':
      return 'Awaiting decision'
    case 'CSIP_CLOSED':
      return 'CSIP closed'
    case 'CSIP_OPEN':
      return 'CSIP open'
    case 'INVESTIGATION_PENDING':
      return 'Investigation pending'
    case 'NO_FURTHER_ACTION':
      return 'No further action'
    case 'PLAN_PENDING':
      return 'Plan pending'
    case 'REFERRAL_PENDING':
      return 'Referral pending'
    case 'REFERRAL_SUBMITTED':
      return 'Referral submitted'
    case 'SUPPORT_OUTSIDE_CSIP':
      return 'Support to be provided outside CSIP'
    case 'UNKNOWN':
    default:
      throw new Error('Unrecognised CSIP status')
  }
}
