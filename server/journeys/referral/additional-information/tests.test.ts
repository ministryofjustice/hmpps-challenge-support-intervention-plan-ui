import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'

const TEST_PATH = 'referral/additional-information'
const uuid = uuidv4()
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
    descriptionOfConcern: 'Sample Description Text',
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
    services: {},
    uuid,
    requestCaptor,
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/additional-information', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Add additional information (optional)')).toBeVisible()
    expect((getByRole(html, 'textbox', { name: '' }) as HTMLInputElement).value).toEqual('')
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            otherInformation: 'Sample Text',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Add additional information (optional)')).toBeVisible()
    expect((getByRole(html, 'textbox', { name: '' }) as HTMLInputElement).value).toEqual('Sample Text')
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({
        journeyData: journeyDataMock,
        validationErrors: { propertyName: ['Error message'] },
      }),
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

describe('POST /referral/additional-information', () => {
  it('redirect to /referral/check-answers, save Other Information on valid request', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ otherInformation: 'Sample Text' })
      .expect(302)
      .expect('Location', 'check-answers')

    expect(reqCaptured.journeyData().referral?.otherInformation).toEqual('Sample Text')
  })

  it('redirect to /referral/check-answers, convert empty Other Information into null', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ otherInformation: '' })
      .expect(302)
      .expect('Location', 'check-answers')

    expect(reqCaptured.journeyData().referral?.otherInformation).toBeNull()
  })

  it('redirect to go back and set validation errors if Known Reasons exceeds 4000 characters', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ otherInformation: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      otherInformation: ['Additional information must be 4,000 characters or less'],
    })
  })
})
