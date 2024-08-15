import { Router } from 'express'
import { Services } from '../../services'
import { ReferralRoutes } from './referral/routes'
import { ScreenRoutes } from './screen/routes'
import { InvestigationRoutes } from './record-investigation/routes'
import populatePrisonerSummary from '../../middleware/populatePrisonerSummary'
import { DecisionRoutes } from './record-decision/routes'

export const JourneyRoutes = (services: Services) => {
  const router = Router({ mergeParams: true })

  router.use(populatePrisonerSummary())

  router.use('/', ReferralRoutes({ services, path: '/referral' }))
  router.use('/', ScreenRoutes({ services, path: '/screen' }))
  router.use('/', InvestigationRoutes({ services, path: '/record-investigation' }))
  router.use('/', DecisionRoutes({ services, path: '/record-decision' }))

  if (process.env.NODE_ENV === 'e2e-test') {
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
