/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'
import { convertToTitleCase, initialiseName, sentenceCase } from './utils'
import config from '../config'
import { buildErrorSummaryList, customErrorOrderBuilder, findError } from '../middleware/validationMiddleware'
import { formatDisplayDate, formatSimpleDisplayDate, todayStringGBFormat } from './datetimeUtils'
import { YES_NO_ANSWER } from '../routes/journeys/referral/safer-custody/schemas'
import { csipStatusDisplayText, csipStatusTagClass, identifiedNeedsActionLabel } from './csipDisplayTextUtils'
import {
  firstNameSpaceLastName,
  lastNameCommaFirstName,
  personDateOfBirth,
  personProfileName,
} from './miniProfileUtils'
import logger from '../../logger'
import { convertToSortableColumns, datePriority } from '../routes/manage-csips/components/filters'
import { setSelected, boldAppendStamp, shyHyphens } from './viewUtils'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  const packageJson = path.join(__dirname, '../../../package.json')
  app.locals.applicationName = JSON.parse(fs.readFileSync(packageJson).toString())['name']
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  app.locals.appInsightsConnectionString = config.appInsightsConnectionString
  app.locals.buildNumber = config.buildNumber

  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(`Could not read asset manifest file: ${e}`)
    }
  }

  app.locals['digitalPrisonServicesUrl'] = config.serviceUrls.digitalPrison
  app.use((_req, res, next) => {
    res.locals['digitalPrisonServicesUrl'] = config.serviceUrls.digitalPrison
    return next()
  })

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      path.join(__dirname, '../../server/routes/journeys'),
      path.join(__dirname, '../../server/routes'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
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
  njkEnv.addFilter('formatSimpleDisplayDate', formatSimpleDisplayDate)
  njkEnv.addFilter('customErrorOrderBuilder', customErrorOrderBuilder)
  njkEnv.addFilter('firstNameSpaceLastName', firstNameSpaceLastName)
  njkEnv.addFilter('lastNameCommaFirstName', lastNameCommaFirstName)
  njkEnv.addFilter('possessiveComma', (name: string) => (name.endsWith('s') ? `${name}’` : `${name}’s`))
  njkEnv.addFilter('shyHyphens', shyHyphens)
  njkEnv.addFilter('datePriority', datePriority)
  njkEnv.addFilter('convertToSortableColumns', convertToSortableColumns)
  njkEnv.addFilter('boldAppendStamp', boldAppendStamp)
  njkEnv.addFilter('setSelected', setSelected)
  njkEnv.addFilter('csipStatusDisplayText', csipStatusDisplayText)
  njkEnv.addFilter('csipStatusTagClass', csipStatusTagClass)
  njkEnv.addFilter('identifiedNeedsActionLabel', identifiedNeedsActionLabel)
  njkEnv.addGlobal('todayStringGBFormat', todayStringGBFormat)
  njkEnv.addGlobal('YesNoDontKnow', YES_NO_ANSWER.enum)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('substring', (str: string, start: number, end?: number) => str && str.substring(start, end))
}
