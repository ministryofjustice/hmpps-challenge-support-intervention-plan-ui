import { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'
import { BaseJourneyController } from '../../base/controller'
import { getNonUndefinedProp } from '../../../../utils/utils'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'

export class NewIdentifiedNeedCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { plan } = req.journeyData
    res.render('update-plan/check-answers/view', {
      need: plan!.identifiedNeedSubJourney,
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
        createdDate: format(new Date(), 'yyyy-MM-dd'),
        ...getNonUndefinedProp(need, 'closedDate'),
        ...getNonUndefinedProp(need, 'progression'),
      })
      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, `You've added another identified need to this plan.`)
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
