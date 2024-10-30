import express, { Express, Locals, Request } from 'express'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import routes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import type { Services } from '../../services'
import AuditService from '../../services/auditService'
import { HmppsUser } from '../../interfaces/hmppsUser'
import setUpWebSession from '../../middleware/setUpWebSession'
import HmppsAuditClient from '../../data/hmppsAuditClient'
import setUpJourneyData from '../../middleware/setUpJourneyData'
import logger from '../../../logger'
import config from '../../config'
import populateValidationErrors from '../../middleware/populateValidationErrors'
import setUpAuth from '../../middleware/setUpAuthentication'
import { JourneyData } from '../../@types/express'
import breadcrumbs from '../../middleware/breadcrumbs'
import { FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

jest.mock('../../services/auditService')
jest.mock('../../data/hmppsAuditClient')

export const user: HmppsUser = {
  name: 'FIRST LAST',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  authSource: 'nomis',
  staffId: 1234,
  userRoles: [],
  caseloads: [],
}

export const flashProvider = jest.fn()

function appSetup(
  services: Services,
  production: boolean,
  userSupplier: () => HmppsUser,
  uuid: string,
  requestCaptor?: (req: Request) => void,
  validationErrors?: Locals['validationErrors'],
  journeyData?: Omit<JourneyData, 'instanceUnixEpoch'>,
): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app)
  app.use(setUpWebSession())
  app.use(setUpAuth())
  app.use((req, res, next) => {
    req.user = userSupplier() as Express.User
    res.locals = {
      ...res.locals,
      user: { ...req.user } as HmppsUser,
    }
    next()
  })
  if (validationErrors) {
    app.use((req, _res, next) => {
      req.flash(FLASH_KEY__VALIDATION_ERRORS, JSON.stringify(validationErrors))
      next()
    })
  }
  app.use((req, _res, next) => {
    req.id = uuid
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(setUpJourneyData())
  if (requestCaptor) {
    app.use((req, _res, next) => {
      requestCaptor(req)
      next()
    })
  } else {
    app.use((req, _res, next) => {
      req.session.journeyDataMap ??= {}
      req.session.journeyDataMap[uuid] = {
        instanceUnixEpoch: Date.now(),
        ...journeyData,
      }
      next()
    })
  }
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
  app.use(breadcrumbs())
  app.use((_req, res, next) => {
    res.notFound = () => res.status(404).render('pages/not-found')
    next()
  })
  app.use(routes(services))
  app.use((_req, res) => res.notFound())
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
  uuid,
  requestCaptor = undefined,
  validationErrors,
  journeyData,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => HmppsUser
  uuid: string
  requestCaptor?: (req: Request) => void
  validationErrors?: Locals['validationErrors']
  journeyData?: Omit<JourneyData, 'instanceUnixEpoch'>
}): Express {
  return appSetup(services as Services, production, userSupplier, uuid, requestCaptor, validationErrors, journeyData)
}
