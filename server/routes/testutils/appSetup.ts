import express, { Express, Locals } from 'express'
import { NotFound } from 'http-errors'
import { v4 as uuidv4 } from 'uuid'

import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import type { Services } from '../../services'
import type { ApplicationInfo } from '../../applicationInfo'
import AuditService from '../../services/auditService'
import { HmppsUser } from '../../interfaces/hmppsUser'
import setUpWebSession from '../../middleware/setUpWebSession'
import HmppsAuditClient from '../../data/hmppsAuditClient'
import setUpJourneyData from '../../middleware/setUpJourneyData'
import logger from '../../../logger'
import config from '../../config'
import populateValidationErrors from '../../middleware/populateValidationErrors'
import setUpAuth from '../../middleware/setUpAuthentication'

jest.mock('../../services/auditService')
jest.mock('../../data/hmppsAuditClient')

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
  branchName: 'main',
}

export const user: HmppsUser = {
  name: 'FIRST LAST',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  authSource: 'nomis',
  staffId: 1234,
  userRoles: [],
}

export const flashProvider = jest.fn()

function appSetup(
  services: Services,
  production: boolean,
  userSupplier: () => HmppsUser,
  validationErrors?: Locals['validationErrors'],
): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, testAppInfo)
  app.use(setUpWebSession())
  app.use(setUpAuth())
  app.use((req, res, next) => {
    req.user = userSupplier() as Express.User
    res.locals = {
      user: { ...req.user } as HmppsUser,
    }
    next()
  })
  if (validationErrors) {
    app.use((req, _res, next) => {
      req.flash('validationErrors', JSON.stringify(validationErrors))
      next()
    })
  }
  app.use((req, _res, next) => {
    req.id = uuidv4()
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(setUpJourneyData())
  app.use(populateValidationErrors())
  app.get(
    '*',
    dpsComponents.getPageComponents({
      logger,
      includeMeta: true,
      dpsUrl: config.serviceUrls.digitalPrison,
      timeoutOptions: { response: 50, deadline: 50 },
    }),
  )
  app.use(routes(services))
  app.use((_req, _res, next) => next(new NotFound()))
  app.use(errorHandler(production))

  return app
}

export function appWithAllRoutes({
  production = false,
  services = {
    auditService: new AuditService(
      new HmppsAuditClient({
        enabled: false,
        queueUrl: '',
        region: '',
        serviceName: '',
      }),
    ) as jest.Mocked<AuditService>,
  },
  userSupplier = () => user,
  validationErrors,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => HmppsUser
  validationErrors?: Locals['validationErrors']
}): Express {
  auth.default.authenticationMiddleware = () => (_req, _res, next) => next()
  return appSetup(services as Services, production, userSupplier, validationErrors)
}
