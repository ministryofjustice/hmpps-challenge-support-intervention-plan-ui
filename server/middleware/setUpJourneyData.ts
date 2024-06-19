import { RequestHandler } from 'express'
import { JourneyData } from '../@types/express'

const MAX_CONCURRENT_JOURNEYS = 100

export default function setUpJourneyData(): RequestHandler {
  return async (req, res, next) => {
    req.session.journeyDataMap ??= new Map<string, JourneyData>()

    const journeyHousekeeping = () => {
      if (req.session.journeyDataMap.size > MAX_CONCURRENT_JOURNEYS) {
        const oldestKey = Array.from(req.session.journeyDataMap.entries()).reduce((a, b) =>
          a[1].instanceUnixEpoch < b[1].instanceUnixEpoch ? a : b,
        )[0]
        req.session.journeyDataMap.delete(oldestKey)
      }
    }

    Object.defineProperty(req, 'journeyData', {
      get() {
        const journeyId = req.params.journeyId ?? 'default'
        if (!req.session.journeyDataMap.has(journeyId)) {
          req.session.journeyDataMap.set(journeyId, { instanceUnixEpoch: Date.now() } as JourneyData)
        }
        journeyHousekeeping()
        return req.session.journeyDataMap.get(journeyId)
      },
      set(value?: JourneyData) {
        const journeyId = req.params.journeyId ?? 'default'
        if (value) {
          req.session.journeyDataMap.set(journeyId, { ...value, instanceUnixEpoch: Date.now() })
        } else {
          req.session.journeyDataMap.delete(journeyId)
        }
        journeyHousekeeping()
      },
    })
    next()
  }
}
