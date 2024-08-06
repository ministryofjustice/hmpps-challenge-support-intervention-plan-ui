import { Locals, Request } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor, { TestRequestCaptured } from '../../../testutils/testRequestCaptor'
import createTestHtmlElement from '../../../testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../testutils/testConstants'

const TEST_PATH = 'referral/contributory-factors'
const uuid = uuidV4()

const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const journeyDataMock = {
  prisoner: TEST_PRISONER,
  referral: {
    isOnBehalfOfReferral: false,
    referredBy: 'Test User',
    refererArea: { code: 'A', description: 'TEXT' },
    isProactiveReferral: true,
    incidentLocation: { code: 'A', description: 'TEXT' },
    incidentType: { code: 'A', description: 'TEXT' },
    incidentDate: '2024-12-25',
    incidentTime: '23:59',
    descriptionOfConcern: 'Sample Concern Text',
  },
} as JourneyData

let reqCaptured: TestRequestCaptured
let requestCaptor: (req: Request) => void

const app = (
  {
    journeyData,
    validationErrors,
  }: {
    journeyData?: JourneyData
    validationErrors?: Locals['validationErrors']
  } = { journeyData: journeyDataMock, validationErrors: undefined },
) => {
  ;[reqCaptured, requestCaptor] = testRequestCaptor(journeyData, uuid)
  return appWithAllRoutes({
    services: { csipApiService },
    uuid,
    requestCaptor,
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/contributory-factors', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'What are the contributory factors?')).toBeVisible()
    expect((getByRole(html, 'checkbox', { name: 'TEXT' }) as HTMLInputElement).checked).toBeFalsy()
    expect((getByRole(html, 'checkbox', { name: 'TEXT2' }) as HTMLInputElement).checked).toBeFalsy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            contributoryFactors: [{ factorType: { code: 'A', description: 'TEXT' } }],
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'What are the contributory factors?')).toBeVisible()
    expect(getByText(html, 'Select all that apply.')).toBeVisible()
    expect((getByRole(html, 'checkbox', { name: 'TEXT' }) as HTMLInputElement).checked).toBeTruthy()
    expect((getByRole(html, 'checkbox', { name: 'TEXT2' }) as HTMLInputElement).checked).toBeFalsy()
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({ journeyData: journeyDataMock, validationErrors: { propertyName: ['Error message'] } }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/contributory-factors', () => {
  it('redirect to /referral/contributory-factors-comments, save multiple contributory factors on valid request', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ contributoryFactors: ['A', 'B'] })
      .expect(302)
      .expect('Location', 'contributory-factors-comments')

    expect(reqCaptured.journeyData().referral?.contributoryFactors).toEqual([
      { factorType: { code: 'A', description: 'TEXT' } },
      { factorType: { code: 'B', description: 'TEXT2' } },
    ])
  })

  it('redirect to /referral/contributory-factors-comments, save single contributory factor on valid request', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ contributoryFactors: 'B' })
      .expect(302)
      .expect('Location', 'contributory-factors-comments')

    expect(reqCaptured.journeyData().referral?.contributoryFactors).toEqual([
      { factorType: { code: 'B', description: 'TEXT2' } },
    ])
  })

  it('redirect to go back and set validation errors if submitted contributory factor is missing', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ contributoryFactors: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ contributoryFactors: ['Select the contributory factors'] })
  })

  it('redirect to go back and set validation errors if submitted contributory factor does not exist or is inactive', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ contributoryFactors: ['A', 'C'] })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ contributoryFactors: ['Select the contributory factors'] })
  })
})
