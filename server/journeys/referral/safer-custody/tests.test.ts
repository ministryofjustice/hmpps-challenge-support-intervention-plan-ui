import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'
import { schema } from './schemas'

const TEST_PATH = 'referral/safer-custody'
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

describe('GET /referral/safer-custody', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Is the Safer Custody team already aware of this referral?')).toBeVisible()
    expect((getByRole(html, 'radio', { name: 'Yes' }) as HTMLInputElement).checked).toBeFalsy()
    expect((getByRole(html, 'radio', { name: 'No' }) as HTMLInputElement).checked).toBeFalsy()
    expect((getByRole(html, 'radio', { name: 'I don’t know' }) as HTMLInputElement).checked).toBeFalsy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            isSaferCustodyTeamInformed: schema.shape.isSaferCustodyTeamInformed.enum.DO_NOT_KNOW,
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Is the Safer Custody team already aware of this referral?')).toBeVisible()
    expect((getByRole(html, 'radio', { name: 'Yes' }) as HTMLInputElement).checked).toBeFalsy()
    expect((getByRole(html, 'radio', { name: 'No' }) as HTMLInputElement).checked).toBeFalsy()
    expect((getByRole(html, 'radio', { name: 'I don’t know' }) as HTMLInputElement).checked).toBeTruthy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            isSaferCustodyTeamInformed: schema.shape.isSaferCustodyTeamInformed.enum.YES,
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Is the Safer Custody team already aware of this referral?')).toBeVisible()
    expect((getByRole(html, 'radio', { name: 'Yes' }) as HTMLInputElement).checked).toBeTruthy()
    expect((getByRole(html, 'radio', { name: 'No' }) as HTMLInputElement).checked).toBeFalsy()
    expect((getByRole(html, 'radio', { name: 'I don’t know' }) as HTMLInputElement).checked).toBeFalsy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            isSaferCustodyTeamInformed: schema.shape.isSaferCustodyTeamInformed.enum.NO,
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Is the Safer Custody team already aware of this referral?')).toBeVisible()
    expect((getByRole(html, 'radio', { name: 'Yes' }) as HTMLInputElement).checked).toBeFalsy()
    expect((getByRole(html, 'radio', { name: 'No' }) as HTMLInputElement).checked).toBeTruthy()
    expect((getByRole(html, 'radio', { name: 'I don’t know' }) as HTMLInputElement).checked).toBeFalsy()
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

describe('POST /referral/safer-custody', () => {
  it('redirect to /referral/additional-information, save isSaferCustodyInformed answer on valid request', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ isSaferCustodyTeamInformed: schema.shape.isSaferCustodyTeamInformed.enum.YES })
      .expect(302)
      .expect('Location', 'additional-information')

    expect(reqCaptured.journeyData().referral?.isSaferCustodyTeamInformed).toEqual(
      schema.shape.isSaferCustodyTeamInformed.enum.YES,
    )
  })

  it('redirect to go back and set validation errors if isSaferCustodyInformed answer is invalid', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ isSaferCustodyTeamInformed: '' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      isSaferCustodyTeamInformed: [
        "Select if the Safer Custody team is already aware of this referral or not, or select 'I don't know",
      ],
    })
  })
})
