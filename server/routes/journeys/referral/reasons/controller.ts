import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralReasonsController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/reasons/view', {
      isProactiveReferral: req.journeyData.referral!.isProactiveReferral,
      knownReasons: res.locals.formResponses?.['knownReasons'] ?? req.journeyData.referral!.knownReasons,
      backUrl: 'description',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.knownReasons = req.body.knownReasons
    res.redirect('contributory-factors')
  }
}
