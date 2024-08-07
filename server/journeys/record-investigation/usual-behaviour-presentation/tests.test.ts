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

const URL = `/${uuid}/record-investigation/usual-behaviour-presentation`

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

describe('GET record-investigation/usual-behaviour-presentation', () => {
  it('should render page correctly', async () => {
    const result = await request(app()).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'Record a CSIP investigation')).toBeInTheDocument()
    expect(getByText(html, 'Where to find this information')).toBeInTheDocument()
    expect(
      getByText(html, `What’s ${prisoner.firstName} ${prisoner.lastName}’s usual behaviour presentation?`),
    ).toBeInTheDocument()
    expect(
      getByRole(html, 'textbox', {
        name: `What’s ${prisoner.firstName} ${prisoner.lastName}’s usual behaviour presentation?`,
      }),
    ).toHaveValue('')
    expect(getByRole(html, 'button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('should pre-fill form with values from journeyData', async () => {
    const appWithMock = app({ journeyData: { ...journeyDataMock, investigation: { personsUsualBehaviour: 'test' } } })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(
      getByRole(html, 'textbox', {
        name: `What’s ${prisoner.firstName} ${prisoner.lastName}’s usual behaviour presentation?`,
      }),
    ).toHaveValue('test')
  })

  it('should render validation errors', async () => {
    const appWithMock = app({
      journeyData: journeyDataMock,
      validationErrors: { personsUsualBehaviour: ['Error message'] },
    })
    const result = await request(appWithMock).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#personsUsualBehaviour$/)
  })
})

describe('POST record-investigation/usual-behaviour-presentation', () => {
  it('should redirect to ../record-investigation', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ personsUsualBehaviour: 'test' })
      .expect(302)
      .expect('Location', '../record-investigation')
  })

  it('should redirect to same page when personsUsualBehaviour is empty', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ personsUsualBehaviour: '   ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      personsUsualBehaviour: ['Enter a description of the prisoner’s usual behaviour presentation'],
    })
  })

  it('should redirect to same page when personsUsualBehaviour is over 4000 characters', async () => {
    await request(app())
      .post(URL)
      .type('form')
      .send({ personsUsualBehaviour: 'o'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      personsUsualBehaviour: [
        'Description of the prisoner’s usual behaviour presentation must be 4,000 characters or less',
      ],
    })
  })
})
