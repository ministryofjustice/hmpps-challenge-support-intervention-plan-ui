import { NextFunction, Request, Response } from 'express'
import { JourneyData } from '../@types/express'
import TokenStore from '../data/tokenStore/tokenStore'
import config from '../config'

export default function setUpJourneyData(store: TokenStore) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const journeyId = req.params['journeyId'] ?? 'default'
    const journeyTokenKey = `journey.${req.user?.username}.${journeyId}`

    const cached = await store.getToken(journeyTokenKey)
    req.journeyData = cached
      ? (JSON.parse(cached) as JourneyData)
      : (req.journeyData ?? {
          stateGuard: process.env.NODE_ENV === 'e2e-test' ? false : config.features.stateGuard,
          instanceUnixEpoch: Date.now(),
        })
    res.prependOnceListener('close', async () => {
      await store.setToken(journeyTokenKey, JSON.stringify(req.journeyData), 20 * 60 * 60)
    })
    next()
  }
}
