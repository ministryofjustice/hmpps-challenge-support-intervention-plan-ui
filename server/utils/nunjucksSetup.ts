/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { personDateOfBirth, personProfileName } from 'hmpps-court-cases-release-dates-design/hmpps/utils/utils'
import { convertToTitleCase, initialiseName, sentenceCase } from './utils'
import { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import { buildErrorSummaryList, findError } from '../middleware/validationMiddleware'
import { formatDisplayDate, todayStringGBFormat } from './datetimeUtils'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals['asset_path'] = '/assets/'
  app.locals['applicationName'] = 'Hmpps Challenge Support Intervention Plan Ui'
  app.locals['environmentName'] = config.environmentName
  app.locals['environmentNameColour'] = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals['version'] = applicationInfo.gitShortHash
    app.locals['digitalPrisonServicesUrl'] = config.serviceUrls.digitalPrison
  } else {
    // Version changes every request
    app.use((_req, res, next) => {
      res.locals['version'] = Date.now().toString()
      res.locals['digitalPrisonServicesUrl'] = config.serviceUrls.digitalPrison
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      path.join(__dirname, '../../server/journeys'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
      'node_modules/hmpps-court-cases-release-dates-design/',
      'node_modules/hmpps-court-cases-release-dates-design/hmpps/components/',
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
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('convertToTitleCase', convertToTitleCase)
  njkEnv.addFilter('sentenceCase', sentenceCase)
  njkEnv.addFilter('formatDisplayDate', formatDisplayDate)
  njkEnv.addFilter('filterBy', (array: object[], filter: (itm: object) => boolean) => array.filter(filter))
  njkEnv.addGlobal('todayStringGBFormat', todayStringGBFormat)
}
