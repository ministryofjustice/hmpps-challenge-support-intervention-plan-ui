import { NextFunction, Request, Response } from 'express'
import { JourneyData } from '../@types/express'
import TokenStore from '../data/tokenStore/tokenStore'

// Off by default for cypress tests to enable the many isolated page tests to work without mocking
// Enable this in test explicitly by injecting journeyData with stateGuard set to true
const stateGuard = process.env.NODE_ENV !== 'e2e-test'

export default function setUpJourneyData(store: TokenStore) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const journeyId = req.params['journeyId'] ?? 'default'
    const journeyTokenKey = `journey.${req.user?.username}.${journeyId}`

    const cached = await store.getToken(journeyTokenKey)

    req.journeyData = cached ? (JSON.parse(cached) as JourneyData) : (req.journeyData ?? { stateGuard })
    res.prependOnceListener('close', async () => {
      if (!req.journeyData) {
        await store.delToken(journeyTokenKey)
      } else {
        await store.setToken(journeyTokenKey, JSON.stringify(req.journeyData ?? { stateGuard }), 68 * 60 * 60)
      }
    })
    next()
  }
}
