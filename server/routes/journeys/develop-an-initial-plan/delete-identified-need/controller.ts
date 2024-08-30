import { Request, Response } from 'express'

export class DeleteIdentifiedNeedController {
  GET = async (req: Request, res: Response) => {
    const { index } = req.params

    if (isInvalidNeedIndex(index, req)) {
      res.notFound()
    } else {
      res.render('develop-an-initial-plan/delete-identified-need/view', {
        identifiedNeed: req.journeyData.plan!.identifiedNeeds![Number(index) - 1],
        backUrl: '../identified-needs',
      })
    }
  }

  POST = async (req: Request, res: Response) => {
    const { index } = req.params
    if (isInvalidNeedIndex(index, req)) {
      res.redirect('back')
      return
    }
    const identifiedNeeds = req.journeyData.plan!.identifiedNeeds!.slice()
    identifiedNeeds.splice(Number(index) - 1, 1)
    if (identifiedNeeds.length) {
      req.journeyData.plan!.identifiedNeeds = identifiedNeeds
    } else {
      delete req.journeyData.plan!.identifiedNeeds
      delete req.journeyData.isCheckAnswers
    }

    res.redirect('../identified-needs')
  }
}

const isInvalidNeedIndex = (index: string | undefined, req: Request) => {
  return Number.isNaN(index) || (req.journeyData.plan?.identifiedNeeds?.length || 0) < Number(index)
}
