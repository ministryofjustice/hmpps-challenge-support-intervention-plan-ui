import { Request, Response } from 'express'
import { SchemaType } from '../../record-decision/next-steps/schemas'

export class NextStepsController {
  GET = async (req: Request, res: Response) => {
    const nextSteps = res.locals.formResponses?.['nextSteps'] ?? req.journeyData.decisionAndActions!.nextSteps
    res.render('record-decision/next-steps/view', {
      nextSteps,
      backUrl: 'conclusion',
      changeDecision: true,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.decisionAndActions!.nextSteps = req.body.nextSteps
    res.redirect('additional-information')
  }
}
