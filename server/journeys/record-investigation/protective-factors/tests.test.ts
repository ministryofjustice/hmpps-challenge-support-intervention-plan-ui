import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../testutils/testRequestCaptor'
import { JourneyData } from '../../../@types/express'
import createTestHtmlElement from '../../../testutils/createTestHtmlElement'
import { TEST_PRISONER as prisoner } from '../../../testutils/testConstants'

const uuid = uuidv4()

const journeyDataMock = {
  prisoner,
  investigation: {},
} as JourneyData

const URL = `/${uuid}/record-investigation/protective-factors`

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

describe('GET record-investigation/protective-factors', () => {
  it('should render page correctly', async () => {
    const result = await request(app()).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'Record a CSIP investigation')).toBeInTheDocument()
    expect(getByText(html, 'What type of information to include')).toBeInTheDocument()
    expect(
      getByText(html, `What are the protective factors for ${prisoner.firstName} ${prisoner.lastName}?`),
    ).toBeInTheDocument()
    expect(
      getByRole(html, 'textbox', {
        name: `What are the protective factors for ${prisoner.firstName} ${prisoner.lastName}?`,
      }),
    ).toHaveValue('')
    expect(getByRole(html, 'button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('should pre-fill form with values from journeyData', async () => {
    const appWithMock = app({ journeyData: { ...journeyDataMock, investigation: { protectiveFactors: 'test' } } })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(
      getByRole(html, 'textbox', {
        name: `What are the protective factors for ${prisoner.firstName} ${prisoner.lastName}?`,
      }),
    ).toHaveValue('test')
  })

  it('should render validation errors', async () => {
    const appWithMock = app({
      journeyData: journeyDataMock,
      validationErrors: { protectiveFactors: ['Error message'] },
    })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#protectiveFactors$/)
  })
})

describe('POST record-investigation/protective-factors', () => {
  it('should redirect to ../record-investigation', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ protectiveFactors: 'test' })
      .expect(302)
      .expect('Location', '../record-investigation')
  })

  it('should redirect to same page when protectiveFactors is empty', async () => {
    await request(app()).post(URL).type('form').send({ protectiveFactors: '   ' }).expect(302).expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      protectiveFactors: ['Enter a description of the prisoner’s protective factors'],
    })
  })

  it('should redirect to same page when protectiveFactors is over 4000 characters', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ protectiveFactors: 'o'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      protectiveFactors: ['Description of the prisoner’s protective factors must be 4,000 characters or less'],
    })
  })
})
