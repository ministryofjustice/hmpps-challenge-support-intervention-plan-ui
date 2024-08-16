import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class DecisionAdditionalInformationController {
  GET = async (req: Request, res: Response) => {
    const actionOther = res.locals.formResponses?.['actionOther'] || req.journeyData.decisionAndActions!.actionOther
    res.render('record-decision/additional-information/view', {
      actionOther,
      backUrl: 'next-steps',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.decisionAndActions!.actionOther = req.body.actionOther
    res.redirect('check-answers')
  }
}
