import { StartJourneyController } from '../../start/controller'
import { Services } from '../../../../services'
import { JourneyRouter } from '../../base/routes'
import { CsipRecord } from '../../../../@types/csip/csipApiTypes'

export default function StartJourneyRoutes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new StartJourneyController(csipApiService, prisonerSearchService)

  get('/', controller.redirectWithCsipData('/check-change-screen', shouldAllowChangeScreen))

  return router
}

export const shouldAllowChangeScreen = (csipRecord: CsipRecord) => {
  const csipRecordCode = csipRecord.status.code
  const currentScreeningOutcome = csipRecord.referral?.saferCustodyScreeningOutcome?.outcome.description

  if (csipRecordCode === 'INVESTIGATION_PENDING' && currentScreeningOutcome === 'Progress to investigation') {
    return true
  }

  if (csipRecordCode === 'PLAN_PENDING' && currentScreeningOutcome === 'Progress to CSIP') {
    return true
  }

  return false
}
