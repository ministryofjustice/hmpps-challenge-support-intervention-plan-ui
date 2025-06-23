import { Request, Response } from 'express'

export class CloseCsipController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/close-csip/view', {
      openIdentifiedNeeds: (req.journeyData.csipRecord?.plan?.identifiedNeeds || []).filter(o => !o.closedDate).length,
      backUrl: 'outcome',
    })
  }

  POST = async (req: Request, res: Response) => {
    if (req.journeyData.review!.outcomeSubJourney?.outcome) {
      req.journeyData.review!.outcome = req.journeyData.review!.outcomeSubJourney.outcome
      delete req.journeyData.review!.outcomeSubJourney
    }
    delete req.journeyData.review!.nextReviewDate
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : '../record-review')
  }
}
