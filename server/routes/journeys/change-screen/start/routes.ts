import { Response } from 'express'
import { StartJourneyController } from '../../start/controller'
import { Services } from '../../../../services'
import { JourneyRouter } from '../../base/routes'
import { isCsipProcessor } from '../../../../authentication/authorisedRoles'
import { CsipRecord } from '../../../../@types/csip/csipApiTypes'
import config from '../../../../config'

export default function StartJourneyRoutes({ csipApiService, prisonerSearchService }: Services) {
  const { router, get } = JourneyRouter()
  const controller = new StartJourneyController(csipApiService, prisonerSearchService)

  get('/', controller.addCsipToJourneyData, (req, res) =>
    res.redirect(
      shouldAllowChangeScreen(req.journeyData.csipRecord!, res)
        ? `/${req.params['journeyId']}/check-change-screen`
        : `/csip-records/${req.journeyData.csipRecord?.recordUuid}`,
    ),
  )

  return router
}

export const shouldAllowChangeScreen = (csipRecord: CsipRecord, res: Response) => {
  if (!config.features.changeFlows) {
    return false
  }

  if (!isCsipProcessor(res)) {
    return false
  }

  const csipRecordCode = csipRecord.status.code
  const currentScreeningOutcome = csipRecord.referral?.saferCustodyScreeningOutcome?.outcome.code

  if (csipRecordCode === 'INVESTIGATION_PENDING' && currentScreeningOutcome === 'OPE') {
    return true
  }

  if (csipRecordCode === 'PLAN_PENDING' && currentScreeningOutcome === 'CUR') {
    return true
  }

  return false
}
