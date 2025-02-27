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
import { UpdateReviewRoutes } from './update-review/routes'
import authorisationMiddleware from '../../middleware/authorisationMiddleware'
import AuthorisedRoles from '../../authentication/authorisedRoles'
import setUpJourneyData from '../../middleware/setUpJourneyData'
import { ChangeScreenRoutes } from './change-screen/routes'
import { ChangeDecisionRoutes } from './change-decision/routes'

export const JourneyRoutes = (services: Services) => {
  const router = Router({ mergeParams: true })

  router.use(setUpJourneyData(services.tokenStore))

  router.use(populatePrisonerSummary())

  router.use('/', ReferralRoutes({ services, path: '/referral' }))
  router.use('/', UpdateReferralRoutes({ services, path: '/update-referral' }))

  router.use(authorisationMiddleware([AuthorisedRoles.ROLE_CSIP_PROCESSOR]))

  router.use('/', ScreenRoutes({ services, path: '/screen' }))
  router.use('/', InvestigationRoutes({ services, path: '/record-investigation' }))
  router.use('/', DecisionRoutes({ services, path: '/record-decision' }))
  router.use('/', DevelopPlanRoutes({ services, path: '/develop-an-initial-plan' }))
  router.use('/', EditLogCodeRoutes({ services, path: '/edit-log-code' }))
  router.use('/', UpdateInvestigationRoutes({ services, path: '/update-investigation' }))
  router.use('/', UpdateDecisionRoutes({ services, path: '/update-decision' }))
  router.use('/', UpdatePlanRoutes({ services, path: '/update-plan' }))
  router.use('/', RecordReviewRoutes({ services, path: '/record-review' }))
  router.use('/', UpdateReviewRoutes({ services, path: '/update-review' }))
  router.use('/', ChangeScreenRoutes({ services, path: '/change-screen' }))
  router.use('/', ChangeDecisionRoutes({ services, path: '/change-decision' }))

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

    router.get('/get-journey-data', (req, res) => {
      res.status(200).send(req.journeyData)
    })
  }

  return router
}
