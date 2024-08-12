/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import {
  firstNameSpaceLastName,
  personDateOfBirth,
  personProfileName,
} from 'hmpps-court-cases-release-dates-design/hmpps/utils/utils'
import fs from 'fs'
import { convertToTitleCase, initialiseName, sentenceCase } from './utils'
import config from '../config'
import { buildErrorSummaryList, customErrorOrderBuilder, findError } from '../middleware/validationMiddleware'
import { formatDisplayDate, todayStringGBFormat } from './datetimeUtils'
import { YES_NO_ANSWER } from '../journeys/referral/safer-custody/schemas'
import logger from '../../logger'
import { csipStatusDisplayText } from './csipDisplayTextUtils'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals['asset_path'] = '/assets/'
  app.locals['applicationName'] = 'Hmpps Challenge Support Intervention Plan Ui'
  app.locals['environmentName'] = config.environmentName
  app.locals['environmentNameColour'] = config.environmentName === 'PRE-PRODUCTION' ? 'govuk-tag--green' : ''
  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error('Could not read asset manifest file')
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
      path.join(__dirname, '../../server/journeys'),
      path.join(__dirname, '../../server/routes'),
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
  njkEnv.addFilter('customErrorOrderBuilder', customErrorOrderBuilder)
  njkEnv.addFilter('firstNameSpaceLastName', firstNameSpaceLastName)
  njkEnv.addFilter('possessiveComma', (name: string) => (name.endsWith('s') ? `${name}’` : `${name}’s`))
  njkEnv.addFilter('csipStatusDisplayText', csipStatusDisplayText)
  njkEnv.addGlobal('todayStringGBFormat', todayStringGBFormat)
  njkEnv.addGlobal('YesNoDontKnow', YES_NO_ANSWER.enum)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
}
