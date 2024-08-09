import { Request, Response } from 'express'

export class DeleteInterviewController {
  GET = async (req: Request, res: Response) => {
    const { index } = req.params
    res.render('record-investigation/delete-interview/view', {
      interview: req.journeyData.investigation!.interviews![Number(index) - 1],
      backUrl: '../interviews-summary',
    })
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
