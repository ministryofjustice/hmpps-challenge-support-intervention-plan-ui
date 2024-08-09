import { Request, Response } from 'express'

export class DeleteInterviewController {
  GET = async (req: Request, res: Response) => {
    const { index } = req.params

    if (Number.isNaN(index) || (req.journeyData.investigation!.interviews?.length || 0) < Number(index)) {
      res.render('pages/error', {
        message: 'Interview not found',
        status: 404,
      })
    } else {
      res.render('record-investigation/delete-interview/view', {
        interview: req.journeyData.investigation!.interviews![Number(index) - 1],
        backUrl: '../interviews-summary',
      })
    }
  }

  POST = async (req: Request, res: Response) => {
    const { index } = req.params
    const interviews = req.journeyData.investigation!.interviews!.slice()
    interviews.splice(Number(index) - 1, 1)
    if (interviews.length) {
      req.journeyData.investigation!.interviews = interviews
    } else {
      delete req.journeyData.investigation!.interviews
    }

    res.redirect('../interviews-summary')
  }
}
