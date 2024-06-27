import { Request } from 'express'
import { JourneyData } from '../../@types/express'

export default function journeyDataCaptor(journeyData: JourneyData, uuid: string) {
  return (req: Request) => {
    req.session.journeyDataMap ??= {}
    req.session.journeyDataMap[uuid] ??= journeyData
  }
}
