import express from 'express'

import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'

import * as Sentry from '@sentry/node'
// @ts-expect-error Import untyped middleware for cypress coverage
import cypressCoverage from '@cypress/code-coverage/middleware/express'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'
import type { Services } from './services'
import config from './config'
import logger from '../logger'
import populateClientToken from './middleware/populateSystemClientToken'
import PrisonerImageRoutes from './routes/prisonerImageRoutes'
import populateValidationErrors from './middleware/populateValidationErrors'
import breadcrumbs from './middleware/breadcrumbs'
import './sentry'
import sentryMiddleware from './middleware/sentryMiddleware'
import { handleApiError } from './middleware/handleApiError'
import { auditPageViewMiddleware } from './middleware/auditPageViewMiddleware'
import checkServiceEnabledForActiveCaseLoad from './middleware/checkServiceEnabledForActiveCaseLoad'

export default function createApp(services: Services): express.Application {
  const app = express()

  if (process.env.NODE_ENV === 'e2e-test') {
    cypressCoverage(app)
  }

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(sentryMiddleware())
  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.get('*', auditPageViewMiddleware(services.auditService))

  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())
  app.use(populateClientToken())
  app.use((_req, res, next) => {
    res.notFound = () => res.status(404).render('pages/not-found')
    next()
  })
  app.get('/prisoner-image/:prisonerNumber', new PrisonerImageRoutes(services.prisonApiService).GET)
  app.get(
    '*',
    dpsComponents.getPageComponents({
      logger,
      includeSharedData: true,
      dpsUrl: config.serviceUrls.digitalPrison,
      timeoutOptions: {
        response: config.apis.componentApi.timeout.response,
        deadline: config.apis.componentApi.timeout.deadline,
      },
    }),
  )
  app.use(breadcrumbs())
  app.use(dpsComponents.retrieveCaseLoadData({ logger }))
  app.use(checkServiceEnabledForActiveCaseLoad(services.csipApiService))
  app.use(populateValidationErrors())
  app.use(routes(services))
  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)
  app.use((_req, res) => res.notFound())
  app.use(handleApiError)
  app.use(errorHandler(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'e2e-test'))

  return app
}
