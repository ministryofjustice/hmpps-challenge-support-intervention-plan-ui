import { Request, Response } from 'express'

export class DeleteInterviewController {
  GET = async (req: Request, res: Response) => {
    const { index } = req.params

    if (this.isInvalidInterviewIndex(index, req)) {
      res.notFound()
    } else {
      res.render('record-investigation/delete-interview/view', {
        interview: req.journeyData.investigation!.interviews![Number(index) - 1],
        backUrl: '../interviews-summary',
      })
    }
  }

  POST = async (req: Request, res: Response) => {
    const { index } = req.params

    if (this.isInvalidInterviewIndex(index, req)) {
      return res.redirect(req.get('Referrer') || '/')
    }

    const interviews = req.journeyData.investigation!.interviews!.slice()
    interviews.splice(Number(index) - 1, 1)
    if (interviews.length) {
      req.journeyData.investigation!.interviews = interviews
    } else {
      delete req.journeyData.investigation!.interviews
      delete req.journeyData.isCheckAnswers
    }

    return res.redirect('../interviews-summary')
  }

  private isInvalidInterviewIndex = (index: string | undefined, req: Request) =>
    Number.isNaN(index) || (req.journeyData.investigation!.interviews?.length || 0) < Number(index)
}
