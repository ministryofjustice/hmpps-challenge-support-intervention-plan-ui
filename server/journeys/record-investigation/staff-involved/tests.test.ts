import { Locals, Request } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../testutils/testRequestCaptor'
import createTestHtmlElement from '../../../testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../testutils/testConstants'

const TEST_PATH = 'record-investigation/staff-involved'
const uuid = uuidV4()
const journeyDataMock = {
  prisoner: TEST_PRISONER,
  investigation: {},
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

describe('GET /record-investigation/staff-involved', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'textbox', { name: 'Which staff have been involved in the investigation?' })).toHaveValue('')
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          investigation: {
            staffInvolved: 'Sample text',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'textbox', { name: 'Which staff have been involved in the investigation?' })).toHaveValue(
      'Sample text',
    )
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

describe('POST /record-investigation/staff-involved', () => {
  it('redirect to /record-investigation, save text input on valid request', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ staffInvolved: 'Sample Reasons Text' })
      .expect(302)
      .expect('Location', '../record-investigation')

    expect(reqCaptured.journeyData().investigation?.staffInvolved).toEqual('Sample Reasons Text')
  })

  it('redirect to go back and set validation errors if text input is missing', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ staffInvolved: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      staffInvolved: ['Enter the names of staff involved in the investigation'],
    })
  })

  it('redirect to go back and set validation errors if text input is empty', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ staffInvolved: '  ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      staffInvolved: ['Enter the names of staff involved in the investigation'],
    })
  })

  it('redirect to go back and set validation errors if text input 4000 characters', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ staffInvolved: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      staffInvolved: ['Names of staff involved in the investigation must be 4,000 characters or less'],
    })
  })
})
