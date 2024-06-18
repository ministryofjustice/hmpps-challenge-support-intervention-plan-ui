import { Router } from 'express'
import { JourneyData } from '../@types/express'

export default function setUpJourneyData(): Router {
  const router = Router({ mergeParams: true })

  router.use((req, res, next) => {
    req.session.journeyDataMap ??= new Map<string, JourneyData>()

    Object.defineProperty(req, 'journeyData', {
      get() {
        const journeyId = req.params.journeyId ?? 'default'
        return req.session.journeyDataMap.get(journeyId) || ({} as JourneyData)
      },
      set(value?: JourneyData) {
        const journeyId = req.params.journeyId ?? 'default'
        req.session.journeyDataMap.set(journeyId, value)
      },
    })

    next()
  })

  return router
}
