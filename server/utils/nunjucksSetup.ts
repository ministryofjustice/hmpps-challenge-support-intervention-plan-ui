/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { personDateOfBirth, personProfileName } from 'hmpps-court-cases-release-dates-design/hmpps/utils/utils'
import { initialiseName } from './utils'
import { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import { buildErrorSummaryList } from '../middleware/validationMiddleware'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals['asset_path'] = '/assets/'
  app.locals['applicationName'] = 'Hmpps Challenge Support Intervention Plan Ui'
  app.locals['environmentName'] = config.environmentName
  app.locals['environmentNameColour'] = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  app.locals['digitalPrisonServicesUrl'] = config.serviceUrls.digitalPrison

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals['version'] = applicationInfo.gitShortHash
  } else {
    // Version changes every request
    app.use((_req, res, next) => {
      res.locals['version'] = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      path.join(__dirname, '../../server/journeys'),
      path.join(__dirname, '../../node_modules/govuk-frontend/dist/'),
      path.join(__dirname, '../../node_modules/@ministryofjustice/frontend/'),
      path.join(__dirname, '../../node_modules/@ministryofjustice/frontend/moj/components/'),
      path.join(__dirname, '../../node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/'),
      path.join(__dirname, '../../node_modules/hmpps-court-cases-release-dates-design/'),
      path.join(__dirname, '../../node_modules/hmpps-court-cases-release-dates-design/hmpps/components/'),
    ],
    {
      autoescape: true,
      express: app,
    },
  )
  njkEnv.addFilter('personProfileName', personProfileName)
  njkEnv.addFilter('personDateOfBirth', personDateOfBirth)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('buildErrorSummaryList', buildErrorSummaryList)
}
