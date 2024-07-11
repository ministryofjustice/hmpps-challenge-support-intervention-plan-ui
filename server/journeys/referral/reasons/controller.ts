import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralReasonsController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const knownReasons = res.locals.formResponses?.['knownReasons'] || req.journeyData.referral!.knownReasons
    res.render(
      req.journeyData.referral!.isProactiveReferral
        ? 'referral/reasons/view-proactive'
        : 'referral/reasons/view-reactive',
      {
        knownReasons,
        backUrl: 'description',
      },
    )
  }

  POST = async (req: Request<unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.referral!.knownReasons = req.body.knownReasons
    res.redirect('contributory-factors')
  }
}
