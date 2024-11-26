import { NextFunction, Request, Response } from 'express'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'
import { UpdateReferralContributoryFactorController } from '../../base/updateReferralContributoryFactorController'

export class UpdateContributoryFactorsCommentController extends UpdateReferralContributoryFactorController {
  GET = async (req: Request, res: Response) => {
    const selectedCf = this.getSelectedCf(req)

    if (!selectedCf) {
      return res.notFound()
    }

    return res.render('update-referral/contributory-factor-comment/view', {
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      currentComment: selectedCf.comment || '',
      factorDescription: selectedCf.factorType.description,
      comment: res.locals.formResponses?.['comment'],
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, selectedCf.comment),
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const selectedCf = this.getSelectedCf(req)

    if (!selectedCf) {
      return res.notFound()
    }

    return this.updateContributoryFactor(
      req,
      res,
      next,
      selectedCf,
      selectedCf.factorType.code,
      getTextForApiSubmission(selectedCf.comment!, res.locals.user.displayName, req.body.comment),
    )
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
