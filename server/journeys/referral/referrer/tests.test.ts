import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'

const uuid = uuidv4()
let app: Express
const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const journeyData = {
  prisoner: TEST_PRISONER,
  referral: {
    isOnBehalfOfReferral: true,
  },
} as JourneyData
const [reqCaptured, requestCaptor] = testRequestCaptor(journeyData, uuid)

beforeEach(() => {
  app = appWithAllRoutes({
    services: { csipApiService },
    requestCaptor,
    uuid,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/referrer', () => {
  it('render page', async () => {
    const result = await request(app).get(`/${uuid}/referral/referrer`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'What’s their name?')).toBeVisible()
    expect(getByText(html, 'Which area do they work in?')).toBeVisible()
    expect((getByRole(html, 'option', { name: 'Select area' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const appWithJourneyDataInjected = appWithAllRoutes({
      services: { csipApiService },
      requestCaptor: testRequestCaptor(
        {
          ...journeyData,
          referral: {
            ...journeyData.referral,
            refererArea: { code: 'A', description: 'TEXT' },
            referredBy: 'test user',
          },
        } as JourneyData,
        uuid,
      )[1],
      uuid,
    })

    const result = await request(appWithJourneyDataInjected)
      .get(`/${uuid}/referral/referrer`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect((getByRole(html, 'option', { name: 'Select area' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect((getByRole(html, 'textbox', { name: 'What’s their name?' }) as HTMLInputElement).value).toEqual('test user')
  })

  it('render validation errors if any', async () => {
    const appWithError = appWithAllRoutes({
      services: { csipApiService },
      requestCaptor,
      validationErrors: { propertyName: ['Error message'] },
      uuid,
    })

    const result = await request(appWithError)
      .get(`/${uuid}/referral/referrer`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Which area do they work in?')).toBeVisible()
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/referrer', () => {
  it('redirect to /referral/proactive-or-reactive, save refererArea and referredBy on valid request', async () => {
    await request(app)
      .post(`/${uuid}/referral/referrer`)
      .type('form')
      .send({ areaOfWork: 'A', referredBy: 'test user' })
      .expect(302)
      .expect('Location', 'proactive-or-reactive')

    expect(reqCaptured.journeyData().referral?.refererArea).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.referredBy).toEqual('test user')
  })

  it('redirect to go back and set validation errors if submitted area code is missing', async () => {
    await request(app)
      .post(`/${uuid}/referral/referrer`)
      .type('form')
      .send({ areaOfWork: undefined, referredBy: 'test user' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ["Select the referrer's area of work"] })
  })

  it('redirect to go back and set validation errors if submitted area code does not exist or is inactive', async () => {
    await request(app)
      .post(`/${uuid}/referral/referrer`)
      .type('form')
      .send({ areaOfWork: 'INVALID', referredBy: 'test user' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ["Select the referrer's area of work"] })
  })

  it('redirect to go back and set validation errors if submitted referredBy is empty', async () => {
    await request(app)
      .post(`/${uuid}/referral/referrer`)
      .type('form')
      .send({ areaOfWork: 'A', referredBy: '' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ referredBy: ["Enter the referrer's name"] })
  })

  it('redirect to go back and set validation errors if submitted referredBy contains only white space', async () => {
    await request(app)
      .post(`/${uuid}/referral/referrer`)
      .type('form')
      .send({ areaOfWork: 'A', referredBy: '  ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ referredBy: ["Enter the referrer's name"] })
  })

  it('redirect to go back and set validation errors if submitted referredBy exceeds 240 characters', async () => {
    await request(app)
      .post(`/${uuid}/referral/referrer`)
      .type('form')
      .send({ areaOfWork: 'A', referredBy: 'n'.repeat(241) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ referredBy: ["Referrer's name must be 240 characters or less"] })
  })
})
