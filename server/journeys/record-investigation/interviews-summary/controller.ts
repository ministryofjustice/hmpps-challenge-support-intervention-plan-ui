import { Request, Response } from 'express'

export class InterviewsSummaryController {
  GET = async (req: Request, res: Response) => {
    res.render('record-investigation/interviews-summary/view', {
      interviews: req.journeyData.investigation!.interviews || [],
      newInterviewIndex: (req.journeyData.investigation!.interviews || []).length + 1,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('../record-investigation')
  }
}
