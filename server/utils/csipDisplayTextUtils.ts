import { CsipRecord } from '../@types/csip/csipApiTypes'
import { components } from '../@types/csip'

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
      return 'Support outside of CSIP'
    case 'UNKNOWN':
    default:
      throw new Error(`Unrecognised CSIP status: ${csipRecord.status}`)
  }
}

export const csipStatusTagClass = (csipRecord: CsipRecord) => {
  switch (csipRecord.status) {
    case 'ACCT_SUPPORT':
      return 'govuk-tag--grey'
    case 'AWAITING_DECISION':
      return 'govuk-tag--blue'
    case 'CSIP_CLOSED':
      return 'govuk-tag--grey'
    case 'CSIP_OPEN':
      return 'govuk-tag--turquoise'
    case 'INVESTIGATION_PENDING':
      return 'govuk-tag--blue'
    case 'NO_FURTHER_ACTION':
      return 'govuk-tag--grey'
    case 'PLAN_PENDING':
      return 'govuk-tag--blue'
    case 'REFERRAL_PENDING':
      return 'govuk-tag--blue'
    case 'REFERRAL_SUBMITTED':
      return 'govuk-tag--blue'
    case 'SUPPORT_OUTSIDE_CSIP':
      return 'govuk-tag--grey'
    case 'UNKNOWN':
    default:
      throw new Error(`Unrecognised CSIP status: ${csipRecord.status}`)
  }
}

export const identifiedNeedsActionLabel = (needs: components['schemas']['IdentifiedNeed'][]) => {
  if (needs.length === 0) {
    return 'Add'
  }
  const openNeedsCount = needs.filter(need => !need.closedDate).length
  if (openNeedsCount === 0) {
    return 'Add or reopen'
  }
  if (openNeedsCount === needs.length) {
    return 'Add, change or close'
  }
  return 'Add, change, close or reopen'
}
