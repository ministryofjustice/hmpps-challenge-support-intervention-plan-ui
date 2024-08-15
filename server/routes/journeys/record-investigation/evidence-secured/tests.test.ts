import { Locals, Request } from 'express'
import { v4 as uuidV4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../../testutils/testRequestCaptor'
import { JourneyData } from '../../../../@types/express'
import createTestHtmlElement from '../../../../testutils/createTestHtmlElement'
import { TEST_PRISONER } from '../../../../testutils/testConstants'

const uuid = uuidV4()

const journeyDataMock = {
  prisoner: TEST_PRISONER,
  investigation: {},
} as JourneyData

const URL = `/${uuid}/record-investigation/evidence-secured`

let reqCaptured: TestRequestCaptured
let requestCaptor: (req: Request) => void

type AppMockSetup = { journeyData?: JourneyData; validationErrors?: Locals['validationErrors'] }
const app = ({ journeyData, validationErrors }: AppMockSetup = { journeyData: journeyDataMock }) => {
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

describe('GET record-investigation/evidence-secured', () => {
  it('should render page correctly', async () => {
    const result = await request(app()).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'Record a CSIP investigation')).toBeInTheDocument()
    expect(getByText(html, 'What evidence has been secured?')).toBeInTheDocument()
    expect(getByRole(html, 'textbox', { name: 'What evidence has been secured?' })).toHaveValue('')
    expect(getByRole(html, 'button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('should pre-fill form with values from journeyData', async () => {
    const appWithMock = app({ journeyData: { ...journeyDataMock, investigation: { evidenceSecured: 'test' } } })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByRole(html, 'textbox', { name: 'What evidence has been secured?' })).toHaveValue('test')
  })

  it('should render validation errors', async () => {
    const appWithMock = app({ journeyData: journeyDataMock, validationErrors: { evidenceSecured: ['Error message'] } })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#evidenceSecured$/)
  })
})

describe('POST record-investigation/evidence-secured', () => {
  it('should redirect to ../record-investigation', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ evidenceSecured: 'test' })
      .expect(302)
      .expect('Location', '../record-investigation')
  })

  it('should redirect to same page when evidenceSecured is empty', async () => {
    await request(app()).post(URL).type('form').send({ evidenceSecured: '   ' }).expect(302).expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      evidenceSecured: ['Enter a description of the evidence secured'],
    })
  })

  it('should redirect to same page when evidenceSecured is over 4000 characters', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ evidenceSecured: 'o'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      evidenceSecured: ['Description of the evidence secured must be 4,000 characters or less'],
    })
  })
})
