import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralAdditionalInformationController {
  GET = async (req: Request, res: Response) => {
    const otherInformation =
      res.locals.formResponses?.['otherInformation'] || req.journeyData.referral!.otherInformation
    res.render('referral/additional-information/view', {
      otherInformation,
      backUrl: 'safer-custody',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.otherInformation = req.body.otherInformation
    res.redirect('check-answers')
  }
}
