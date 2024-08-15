import { Express } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../testutils/appSetup'
import testRequestCaptor from '../../../../testutils/testRequestCaptor'
import createTestHtmlElement from '../../../../testutils/createTestHtmlElement'
import { JourneyData } from '../../../../@types/express'
import { TEST_PRISONER } from '../../../../testutils/testConstants'

const uuid = uuidV4()
let app: Express
const journeyData = {
  prisoner: TEST_PRISONER,
  referral: {
    isOnBehalfOfReferral: false,
    referredBy: 'Test User',
    refererArea: { code: 'A', description: 'TEXT' },
  },
} as JourneyData
const [reqCaptured, requestCaptor] = testRequestCaptor(journeyData, uuid)

beforeEach(() => {
  app = appWithAllRoutes({
    services: {},
    uuid,
    requestCaptor,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/proactive-or-reactive', () => {
  it('render page', async () => {
    const result = await request(app)
      .get(`/${uuid}/referral/proactive-or-reactive`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Is this referral proactive or reactive?')).toBeVisible()
    expect(getByRole(html, 'radio', { name: 'Proactive' })).not.toBeChecked()
    expect(getByRole(html, 'radio', { name: 'Reactive' })).not.toBeChecked()
  })

  it('pre-fill form with values from journeyData', async () => {
    const appWithJourneyDataInjected = appWithAllRoutes({
      services: {},
      uuid,
      requestCaptor: testRequestCaptor(
        {
          ...journeyData,
          referral: { ...journeyData.referral, isProactiveReferral: false },
        } as JourneyData,
        uuid,
      )[1],
    })

    const result = await request(appWithJourneyDataInjected)
      .get(`/${uuid}/referral/proactive-or-reactive`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'radio', { name: 'Proactive' })).not.toBeChecked()
    expect(getByRole(html, 'radio', { name: 'Reactive' })).toBeChecked()
  })

  it('render validation errors if any', async () => {
    const appWithError = appWithAllRoutes({
      services: {},
      uuid,
      requestCaptor,
      validationErrors: { propertyName: ['Error message'] },
    })

    const result = await request(appWithError)
      .get(`/${uuid}/referral/proactive-or-reactive`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/proactive-or-reactive', () => {
  it('redirect to /referral/details, save isProactiveReferral on valid request', async () => {
    await request(app)
      .post(`/${uuid}/referral/proactive-or-reactive`)
      .type('form')
      .send({ isProactiveReferral: 'proactive' })
      .expect(302)
      .expect('Location', 'details')

    expect(reqCaptured.journeyData().referral?.isProactiveReferral).toBeTruthy()
  })

  it('redirect to go back and set validation errors if submitted area code is missing', async () => {
    await request(app)
      .post(`/${uuid}/referral/proactive-or-reactive`)
      .type('form')
      .send({ isProactiveReferral: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      isProactiveReferral: ['Select if this referral is proactive or reactive'],
    })
  })
})
