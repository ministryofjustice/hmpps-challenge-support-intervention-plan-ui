import { Router } from 'express'
import { Services } from '../../services'
import { ReferralRoutes } from './referral/routes'
import { ScreenRoutes } from './screen/routes'
import { InvestigationRoutes } from './record-investigation/routes'
import populatePrisonerSummary from '../../middleware/populatePrisonerSummary'
import { DecisionRoutes } from './record-decision/routes'
import { DevelopPlanRoutes } from './develop-an-initial-plan/routes'
import { UpdateReferralRoutes } from './update-referral/routes'
import { EditLogCodeRoutes } from './edit-log-code/routes'
import { UpdateInvestigationRoutes } from './update-investigation/routes'
import { UpdateDecisionRoutes } from './update-decision/routes'
import { UpdatePlanRoutes } from './update-plan/routes'
import { RecordReviewRoutes } from './record-review/routes'

export const JourneyRoutes = (services: Services) => {
  const router = Router({ mergeParams: true })

  router.use(populatePrisonerSummary())

  router.use('/', ReferralRoutes({ services, path: '/referral' }))
  router.use('/', ScreenRoutes({ services, path: '/screen' }))
  router.use('/', InvestigationRoutes({ services, path: '/record-investigation' }))
  router.use('/', DecisionRoutes({ services, path: '/record-decision' }))
  router.use('/', DevelopPlanRoutes({ services, path: '/develop-an-initial-plan' }))
  router.use('/', UpdateReferralRoutes({ services, path: '/update-referral' }))
  router.use('/', EditLogCodeRoutes({ services, path: '/edit-log-code' }))
  router.use('/', UpdateInvestigationRoutes({ services, path: '/update-investigation' }))
  router.use('/', UpdateDecisionRoutes({ services, path: '/update-decision' }))
  router.use('/', UpdatePlanRoutes({ services, path: '/update-plan' }))
  router.use('/', RecordReviewRoutes({ services, path: '/record-review' }))

  if (process.env.NODE_ENV === 'e2e-test') {
    /* eslint-disable no-param-reassign */
    const mergeObjects = <T extends Record<string, unknown>>(destination: T, source: Partial<T>) => {
      Object.entries(source).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          if (!destination[key]) {
            // @ts-expect-error set up object for future recursive writes
            destination[key] = {}
          }
          mergeObjects(destination[key] as Record<string, unknown>, value)
        } else {
          // @ts-expect-error unexpected types
          destination[key] = value
        }
      })
    }

    router.get('/inject-journey-data', (req, res) => {
      const { data } = req.query
      const json = JSON.parse(atob(data as string))
      mergeObjects(req.journeyData, json)
      res.sendStatus(200)
    })
  }

  return router
}
