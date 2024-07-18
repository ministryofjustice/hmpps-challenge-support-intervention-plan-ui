import { Request, Response } from 'express'

export class ReferralCheckAnswersController {
  GET = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.referral!.onBehalfOfSubJourney

    const { referral } = req.journeyData
    const referrerDetailsFilter = (itm: { key: { text: string } }) =>
      referral!.isOnBehalfOfReferral || itm.key.text !== 'Name of referrer'

    const involvementFilter = (itm: { key: { text: string } }) =>
      referral!.assaultedStaffName || itm.key.text !== 'Names of staff assaulted'

    res.render(
      req.journeyData.referral!.isProactiveReferral
        ? 'referral/check-answers/view-proactive'
        : 'referral/check-answers/view-reactive',
      { referral, referrerDetailsFilter, involvementFilter },
    )
  }

  POST = async (_req: Request, res: Response): Promise<void> => {
    res.redirect('confirmation')
  }
}
