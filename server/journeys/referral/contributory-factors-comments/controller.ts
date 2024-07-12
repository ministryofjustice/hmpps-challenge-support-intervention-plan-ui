import { Request, Response } from 'express'
import { escapeHTML } from '../../../utils/utils'

export class ReferralContributoryFactorsCommentsController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const contributoryFactorRows = req.journeyData.referral!.contributoryFactors!.map(factor => [
      {
        text: factor.factorType.description,
      },
      {
        classes: 'govuk-link',
        html: `<a href="${escapeHTML(factor.factorType.code.toLowerCase())}-comment">${escapeHTML(factor.comment) ? 'Edit comment' : 'Add comment'}<span class="govuk-visually-hidden"> for ${escapeHTML(factor.factorType.description)} factor</span></a>`,
      },
    ])
    res.render('referral/contributory-factors-comments/view', {
      contributoryFactorRows,
      backUrl: 'contributory-factors',
    })
  }

  POST = async (_: Request, res: Response): Promise<void> => {
    res.redirect('safer-custody')
  }
}
