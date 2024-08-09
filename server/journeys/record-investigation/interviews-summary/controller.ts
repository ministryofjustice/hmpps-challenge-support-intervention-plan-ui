import { Request, Response } from 'express'

export class InterviewsSummaryController {
  GET = async (req: Request, res: Response) => {
    res.render('record-investigation/interviews-summary/view', {
      interviews: req.journeyData.investigation!.interviews?.filter(o => o.interviewee) || [],
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('../record-investigation')
  }
}
