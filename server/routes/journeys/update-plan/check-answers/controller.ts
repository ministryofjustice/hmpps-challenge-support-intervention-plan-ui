import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { getNonUndefinedProp } from '../../../../utils/utils'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'
import { todayString } from '../../../../utils/datetimeUtils'

export class NewIdentifiedNeedCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    res.render('update-plan/check-answers/view', {
      need: req.journeyData.plan!.identifiedNeedSubJourney,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  checkSubmitToAPI = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const need = req.journeyData.plan!.identifiedNeedSubJourney!
      await this.csipApiService.addIdentifiedNeed(req, {
        identifiedNeed: need.identifiedNeed!,
        intervention: need.intervention!,
        responsiblePerson: need.responsiblePerson!,
        targetDate: need.targetDate!,
        createdDate: todayString(),
        ...getNonUndefinedProp(need, 'progression'),
      })
      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, `You’ve added another identified need to this plan.`)
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
