import { Router } from 'express'
import { Services } from '../services'
import referralRoutes from '../journeys/referral/routes'
import screenRoutes from '../journeys/screen/routes'
import investigationRoutes from '../journeys/record-investigation/routes'
import populatePrisonerSummary from '../middleware/populatePrisonerSummary'
import config from '../config'

export default function journeyRoutes(services: Services) {
  const router = Router({ mergeParams: true })

  router.use(populatePrisonerSummary())

  router.use('/', referralRoutes({ services, path: '/referral' }))
  router.use('/', screenRoutes({ services, path: '/screen' }))
  router.use('/', investigationRoutes({ services, path: '/record-investigation' }))

  if (config.environmentName === 'dev') {
    router.get('/inject-journey-data', (req, res) => {
      const { data } = req.query
      const json = JSON.parse(atob(data as string))
      Object.entries(json).forEach(([key, value]) => {
        // @ts-expect-error unexpected types
        req.journeyData[key] = value
      })
      res.sendStatus(200)
    })
  }

  return router
}
