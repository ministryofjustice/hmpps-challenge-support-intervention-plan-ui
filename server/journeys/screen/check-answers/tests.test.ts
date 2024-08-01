import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor from '../../../routes/testutils/testRequestCaptor'
import { JourneyData } from '../../../@types/express'
import {
  MOCK_INPUT_RADIO,
  MOCK_INPUT_TEXT_MULTI,
  MOCK_INPUT_TEXT_MULTI_EXPECTED,
  TEST_PRISONER,
} from '../../../routes/testutils/testConstants'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { Services } from '../../../services'

const uuid = uuidv4()

const journeyDataMock = {
  prisoner: TEST_PRISONER,
  saferCustodyScreening: {
    outcomeType: MOCK_INPUT_RADIO,
    reasonForDecision: MOCK_INPUT_TEXT_MULTI,
  },
} as JourneyData

const URL = `/${uuid}/screen/check-answers`

let requestCaptor: (req: Request) => void

type PartialServices = Partial<{
  [K in keyof Services]: Partial<Services[K]>
}>

const createMock = <T extends unknown[]>() => {
  const record: T[] = []

  return {
    mock: (...args: T) => record.push(args),
    last: () => record[record.length - 1],
    calls: () => record,
  }
}

const createThrowMock = <T extends unknown[]>() => {
  const record: T[] = []

  return {
    mock: (...args: T) => {
      record.push(args)
      // eslint-disable-next-line no-throw-literal
      throw { data: { userMessage: 'bad request' } }
    },
    last: () => record[record.length - 1],
    calls: () => record,
  }
}

const mockCreateScreeningOutcome = createMock<Parameters<typeof CsipApiService.prototype.createScreeningOutcome>>()

const mockServices: Partial<PartialServices> = {
  csipApiService: {
    createScreeningOutcome: mockCreateScreeningOutcome.mock,
  } as unknown as CsipApiService,
}

const app = (
  journeyData: JourneyData = journeyDataMock,
  services: PartialServices = mockServices,
  validationErrors: Locals['validationErrors'] = {},
) => {
  // eslint-disable-next-line prefer-destructuring
  requestCaptor = testRequestCaptor(journeyData, uuid)[1]
  return appWithAllRoutes({
    services: services as Partial<Services>,
    uuid,
    requestCaptor,
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /screen/check-answers', () => {
  it('should render page correctly', async () => {
    const result = await request(app()).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    const rows = html.getElementsByClassName('govuk-summary-list__row')

    expect(rows[0]?.children[0]?.innerHTML).toContain('Screening outcome')
    expect(rows[0]?.children[1]?.innerHTML).toContain(journeyDataMock.saferCustodyScreening!.outcomeType!.description)
    expect(rows[0]?.children[2]?.innerHTML).toContain('Change')
    expect(rows[0]?.children[2]?.innerHTML).toContain('the screening outcome')
    expect((getByRole(html, 'link', { name: 'Change the screening outcome' }) as HTMLLinkElement).href).toMatch(
      /screen#outcomeType$/,
    )

    expect(rows[1]?.children[0]?.innerHTML).toContain('Reason for decision')
    expect(rows[1]?.children[1]?.innerHTML).toContain(MOCK_INPUT_TEXT_MULTI_EXPECTED)
    expect(rows[1]?.children[2]?.innerHTML).toContain('Change')
    expect(rows[1]?.children[2]?.innerHTML).toContain('the description of the reason for the decision')
    expect(
      (getByRole(html, 'link', { name: 'Change the description of the reason for the decision' }) as HTMLLinkElement)
        .href,
    ).toMatch(/screen#reasonForDecision$/)
  })
})

describe('POST /screen/check-answers', () => {
  it('should redirect to /screen/confirmation', async () => {
    await request(app()).post(URL).type('form').send({}).expect(302).expect('Location', 'confirmation')

    expect(mockCreateScreeningOutcome.last()![1]).toEqual({
      date: new Date().toISOString().substring(0, 10),
      outcomeTypeCode: 'AAA',
      reasonForDecision: MOCK_INPUT_TEXT_MULTI,
      recordedBy: 'USER_GEN',
      recordedByDisplayName: 'User',
    })
  })

  it('redirect to /referral/check-answers on bad api call', async () => {
    await request(app(journeyDataMock, { csipApiService: { createScreeningOutcome: createThrowMock().mock } }))
      .post(URL)
      .type('form')
      .send({})
      .expect(302)
      .expect('Location', '/')
  })
})
