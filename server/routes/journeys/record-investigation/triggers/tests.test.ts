import { Locals, Request } from 'express'
import { v4 as uuidV4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../../testutils/testRequestCaptor'
import { JourneyData } from '../../../../@types/express'
import createTestHtmlElement from '../../../../testutils/createTestHtmlElement'
import { TEST_PRISONER as prisoner } from '../../../../testutils/testConstants'

const uuid = uuidV4()

const journeyDataMock = {
  prisoner: { ...prisoner },
  investigation: {},
} as JourneyData

const URL = `/${uuid}/record-investigation/triggers`

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

describe('GET record-investigation/triggers', () => {
  it('should render page correctly', async () => {
    const result = await request(app()).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'Record a CSIP investigation')).toBeInTheDocument()
    expect(getByText(html, 'Where to find this information')).toBeInTheDocument()
    expect(getByText(html, `What are ${prisoner.firstName} ${prisoner.lastName}’s triggers?`)).toBeInTheDocument()
    expect(
      getByRole(html, 'textbox', { name: `What are ${prisoner.firstName} ${prisoner.lastName}’s triggers?` }),
    ).toHaveValue('')
    expect(getByRole(html, 'button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('should use possessive punctuation', async () => {
    journeyDataMock.prisoner!.lastName = 'Jones'
    const result = await request(app()).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, `What are ${prisoner.firstName} Jones’ triggers?`)).toBeInTheDocument()
    journeyDataMock.prisoner!.lastName = prisoner.lastName
  })

  it('should pre-fill form with values from journeyData', async () => {
    const appWithMock = app({ journeyData: { ...journeyDataMock, investigation: { personsTrigger: 'test' } } })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(
      getByRole(html, 'textbox', { name: `What are ${prisoner.firstName} ${prisoner.lastName}’s triggers?` }),
    ).toHaveValue('test')
  })

  it('should render validation errors', async () => {
    const appWithMock = app({ journeyData: journeyDataMock, validationErrors: { personsTrigger: ['Error message'] } })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#personsTrigger$/)
  })
})

describe('POST record-investigation/triggers', () => {
  it('should redirect to ../record-investigation', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ personsTrigger: 'test' })
      .expect(302)
      .expect('Location', '../record-investigation')
  })

  it('should redirect to same page when personsTrigger is empty', async () => {
    await request(app()).post(URL).type('form').send({ personsTrigger: '   ' }).expect(302).expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      personsTrigger: ['Enter a description of the prisoner’s triggers'],
    })
  })

  it('should redirect to same page when personsTrigger is over 4000 characters', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ personsTrigger: 'o'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      personsTrigger: ['Description of the prisoner’s triggers must be 4,000 characters or less'],
    })
  })
})
