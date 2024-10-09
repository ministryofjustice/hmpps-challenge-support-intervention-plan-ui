import { Request } from 'express'

export const parseIdentifiedNeedIndex = (req: Request) => {
  const index = Number(req.params['index']) - 1
  return {
    success: !Number.isNaN(index) && (req.journeyData.plan!.identifiedNeeds || []).length >= index,
    isNew: (req.journeyData.plan!.identifiedNeeds || []).length === index,
    index,
  }
}
