import { Locals, Request } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../../testutils/testRequestCaptor'
import createTestHtmlElement from '../../../../testutils/createTestHtmlElement'
import { JourneyData } from '../../../../@types/express'
import { TEST_PRISONER } from '../../../../testutils/testConstants'

const TEST_PATH = 'record-investigation/why-behaviour-occurred'
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

describe('GET /record-investigation/why-behaviour-occurred', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'textbox', { name: 'Why did the behaviour occur?' })).toHaveValue('')
    expect(getByText(html, 'What type of information to include')).toBeVisible()
    expect(getByText(html, 'given by the prisoner during conversations or interviews')).toBeInTheDocument()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          investigation: {
            occurrenceReason: 'Sample text',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'textbox', { name: 'Why did the behaviour occur?' })).toHaveValue('Sample text')
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

describe('POST /record-investigation/why-behaviour-occurred', () => {
  it('redirect to /record-investigation, save text input on valid request', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ occurrenceReason: 'Sample Reasons Text' })
      .expect(302)
      .expect('Location', '../record-investigation')

    expect(reqCaptured.journeyData().investigation?.occurrenceReason).toEqual('Sample Reasons Text')
  })

  it('redirect to go back and set validation errors if text input is missing', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ occurrenceReason: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      occurrenceReason: ['Enter a description of why the behaviour occurred'],
    })
  })

  it('redirect to go back and set validation errors if text input is empty', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ occurrenceReason: '  ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      occurrenceReason: ['Enter a description of why the behaviour occurred'],
    })
  })

  it('redirect to go back and set validation errors if text input 4000 characters', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ occurrenceReason: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      occurrenceReason: ['Description of why the behaviour occurred must be 4,000 characters or less'],
    })
  })
})
