import { Request, Response } from 'express'

export class ReferralContributoryFactorCommentController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { factorTypeCode } = req.params
    const factor = req.journeyData.referral!.contributoryFactors!.find(
      itm => itm.factorType.code.toLowerCase() === factorTypeCode,
    )!
    res.render('referral/contributory-factor-comment/view', {
      factorDescription: factor.factorType.description,
      comment: res.locals.formResponses?.['comment'] || factor.comment,
      backUrl: 'contributory-factors-comments',
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { factorTypeCode } = req.params
    const factor = req.journeyData.referral!.contributoryFactors!.find(
      itm => itm.factorType.code.toLowerCase() === factorTypeCode,
    )!
    if (req.body.comment) {
      factor.comment = req.body.comment
    } else {
      delete factor.comment
    }
    res.redirect('contributory-factors-comments')
  }
}
