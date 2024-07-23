import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'
import type CsipApiService from '../../../services/csipApi/csipApiService'

const uuid = uuidv4()
let app: Express
const journeyData = {
  prisoner: TEST_PRISONER,
} as JourneyData

beforeEach(() => {
  app = appWithAllRoutes({
    services: {},
    uuid,
    journeyData,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/confirmation', () => {
  it('should render page', async () => {
    const result = await request(app).get(`/${uuid}/referral/confirmation`).expect(200).expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: /what happens next/i })).toBeVisible()
    expect(getByText(getByRole(html, 'main'), `${TEST_PRISONER.lastName}, ${TEST_PRISONER.firstName}`)).toBeVisible()
  })

  const csipApiService = {
    getReferenceData: () => [
      { code: 'A', description: 'TEXT' },
      { code: 'B', description: 'TEXT2' },
    ],
  } as unknown as CsipApiService
  const journeyDataMock = {
    prisoner: TEST_PRISONER,
    csipRecordCreated: true,
    referral: {
      isOnBehalfOfReferral: true,
      referredBy: 'foobar',
      refererArea: { code: 'A', description: 'foobar' },
      isProactiveReferral: true,
      incidentLocation: { code: 'A', description: 'foobar' },
      incidentType: { code: 'A', description: 'foobar' },
      incidentDate: '2024-12-25',
      incidentTime: '23:59',
      incidentInvolvement: { code: 'A', description: 'foobar' },
      staffAssaulted: true,
      assaultedStaffName: 'foobar',
      descriptionOfConcern: 'foobar',
      knownReasons: 'foobar',
      contributoryFactors: [
        {
          factorType: { code: 'A', description: 'Text' },
        },
        {
          factorType: { code: 'B', description: 'foobar' },
          comment: 'foobar',
        },
        {
          factorType: { code: 'C', description: 'Text with a TLA' },
        },
      ],
      isSaferCustodyTeamInformed: 'yes',
      otherInformation: 'foobar',
    },
  } as JourneyData

  it.each([
    'additional-information',
    'area-of-work',
    'check-answers',
    'contributory-factors',
    'contributory-factors-comments',
    'description',
    'details',
    'involvement',
    'on-behalf-of',
    'proactive-or-reactive',
    'reasons',
    'referrer',
    'safer-custody',
  ])('should redirect to confirmation for %s', async endpoint => {
    await request(
      appWithAllRoutes({
        services: {
          csipApiService,
        },
        uuid,
        journeyData: journeyDataMock,
      }),
    )
      .get(`/${uuid}/referral/${endpoint}`)
      .expect(302)
      .expect('Location', 'confirmation')
  })
})
