import { Express, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'
import { ReferenceDataType } from '../../../@types/csip/csipApiTypes'

const uuid = uuidv4()
let app: Express
const csipApiService = {
  getReferenceData: (_: Request, domain: ReferenceDataType) => {
    switch (domain) {
      case 'incident-location':
        return [{ code: 'A', description: 'TEXT' }]
      case 'incident-type':
        return [{ code: 'B', description: 'TEXT2' }]
      default:
        return []
    }
  },
} as unknown as CsipApiService
const journeyData = {
  prisoner: TEST_PRISONER,
  referral: {
    isOnBehalfOfReferral: false,
    referredBy: 'Test User',
    refererArea: { code: 'A', description: 'TEXT' },
    isProactiveReferral: true,
  },
} as JourneyData
const [reqCaptured, requestCaptor] = testRequestCaptor(journeyData, uuid)

beforeEach(() => {
  app = appWithAllRoutes({
    services: { csipApiService },
    uuid,
    requestCaptor,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/details - Proactive', () => {
  it('render page', async () => {
    const result = await request(app).get(`/${uuid}/referral/details`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'When was the most recent occurrence of the behaviour?')).toBeVisible()
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect(
      (getByRole(html, 'option', { name: 'Select main concern' }) as HTMLOptionElement).defaultSelected,
    ).toBeTruthy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const appWithJourneyDataInjected = appWithAllRoutes({
      services: { csipApiService },
      uuid,
      requestCaptor: testRequestCaptor(
        {
          ...journeyData,
          referral: {
            ...journeyData.referral,
            incidentLocation: { code: 'A', description: 'TEXT' },
            incidentType: { code: 'B', description: 'TEXT2' },
            incidentDate: '2024-12-25',
            incidentTime: '23:59',
          },
        } as JourneyData,
        uuid,
      )[1],
    })

    const result = await request(appWithJourneyDataInjected)
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect(
      (getByRole(html, 'option', { name: 'Select main concern' }) as HTMLOptionElement).defaultSelected,
    ).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'textbox', { name: 'Date of occurrence' }) as HTMLInputElement).value).toEqual('25/12/2024')
    expect((getByRole(html, 'textbox', { name: 'Hour' }) as HTMLInputElement).value).toEqual('23')
    expect((getByRole(html, 'textbox', { name: 'Minute' }) as HTMLInputElement).value).toEqual('59')
  })

  it('render validation errors if any', async () => {
    const appWithError = appWithAllRoutes({
      services: { csipApiService },
      uuid,
      requestCaptor,
      validationErrors: { propertyName: ['Error message'] },
    })

    const result = await request(appWithError)
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('GET /referral/details - Reactive', () => {
  it('render page', async () => {
    const appReactive = appWithAllRoutes({
      services: { csipApiService },
      uuid,
      requestCaptor: testRequestCaptor(
        {
          ...journeyData,
          referral: {
            ...journeyData.referral,
            isProactiveReferral: false,
          },
        } as JourneyData,
        uuid,
      )[1],
    })
    const result = await request(appReactive)
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'When did the incident occur?')).toBeVisible()
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect(
      (getByRole(html, 'option', { name: 'Select incident type' }) as HTMLOptionElement).defaultSelected,
    ).toBeTruthy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const appWithJourneyDataInjected = appWithAllRoutes({
      services: { csipApiService },
      uuid,
      requestCaptor: testRequestCaptor(
        {
          ...journeyData,
          referral: {
            ...journeyData.referral,
            isProactiveReferral: false,
            incidentLocation: { code: 'A', description: 'TEXT' },
            incidentType: { code: 'B', description: 'TEXT2' },
            incidentDate: '2024-12-25',
            incidentTime: '23:59',
          },
        } as JourneyData,
        uuid,
      )[1],
    })

    const result = await request(appWithJourneyDataInjected)
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect(
      (getByRole(html, 'option', { name: 'Select incident type' }) as HTMLOptionElement).defaultSelected,
    ).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'textbox', { name: 'Date of incident' }) as HTMLInputElement).value).toEqual('25/12/2024')
    expect((getByRole(html, 'textbox', { name: 'Hour' }) as HTMLInputElement).value).toEqual('23')
    expect((getByRole(html, 'textbox', { name: 'Minute' }) as HTMLInputElement).value).toEqual('59')
  })

  it('render validation errors if any', async () => {
    const appWithError = appWithAllRoutes({
      services: { csipApiService },
      uuid,
      requestCaptor: testRequestCaptor(
        {
          ...journeyData,
          referral: {
            ...journeyData.referral,
            isProactiveReferral: false,
          },
        } as JourneyData,
        uuid,
      )[1],
      validationErrors: { propertyName: ['Error message'] },
    })

    const result = await request(appWithError)
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/details', () => {
  it('redirect to /referral/involvement, save incident location, type, date, and time on valid request', async () => {
    await request(app)
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '23',
        minute: '59',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', 'involvement')

    expect(reqCaptured.journeyData().referral?.incidentLocation).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.incidentType).toEqual({ code: 'B', description: 'TEXT2' })
    expect(reqCaptured.journeyData().referral?.incidentDate).toEqual('2009-12-25')
    expect(reqCaptured.journeyData().referral?.incidentTime).toEqual('23:59')
  })

  it('redirect to /referral/involvement, save incident location, type, and date (with optional time being empty) on valid request', async () => {
    await request(app)
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', 'involvement')

    expect(reqCaptured.journeyData().referral?.incidentLocation).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.incidentType).toEqual({ code: 'B', description: 'TEXT2' })
    expect(reqCaptured.journeyData().referral?.incidentDate).toEqual('2009-12-25')
    expect(reqCaptured.journeyData().referral?.incidentTime).toBeNull()
  })

  it('redirect to go back and set validation errors if time input is invalid', async () => {
    await request(app)
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '12',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentTime: ['Enter a time using the 24-hour clock'] })
  })

  it('redirect to go back and set validation errors if incident date is in the future', async () => {
    await request(app)
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '25/12/2077',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      incidentDate: ['Date of the most recent occurrence must be today or in the past'],
    })
  })

  it('redirect to go back and set validation errors if incident date is invalid', async () => {
    await request(app)
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '2009-Dec-25',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentDate: ['Enter the date of the most recent occurrence'] })
  })

  it('redirect to go back and set validation errors if incident location is missing', async () => {
    await request(app)
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: '',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      incidentLocation: ['Select the location of the most recent occurrence'],
    })
  })

  it('redirect to go back and set validation errors if incident type is missing', async () => {
    await request(app)
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: '',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentType: ['Select the main concern'] })
  })
})
