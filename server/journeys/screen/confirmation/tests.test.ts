import { Locals, Request } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByText, queryByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor from '../../../testutils/testRequestCaptor'
import { JourneyData } from '../../../@types/express'
import createTestHtmlElement from '../../../testutils/createTestHtmlElement'
import { TEST_PRISONER } from '../../../testutils/testConstants'
import { ReferenceData } from '../../../@types/csip/csipApiTypes'

const uuid = uuidV4()

const getJourneyDataMock = () => {
  return {
    prisoner: TEST_PRISONER,
    saferCustodyScreening: {
      outcomeType: { code: 'OPE', description: 'Progress to investigation' },
    },
  } as JourneyData
}

const URL = `/${uuid}/screen/confirmation`

let requestCaptor: (req: Request) => void

type AppMockSetup = { journeyData?: JourneyData; validationErrors?: Locals['validationErrors'] }
const app = ({ journeyData, validationErrors }: AppMockSetup = { journeyData: getJourneyDataMock() }) => {
  // eslint-disable-next-line prefer-destructuring
  requestCaptor = testRequestCaptor(journeyData, uuid)[1]
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

describe('GET screen/confirmation', () => {
  it('should render page correctly for outcome type "Progress to investigation"', async () => {
    const result = await request(app()).get(URL).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'CSIP referral screening outcome recorded')).toBeVisible()
    expect(getByText(html, 'Progress to investigation')).toBeVisible()

    expect(getByText(html, 'We’ve updated the status of the referral to “investigation pending”.')).toBeVisible()

    expect(getByText(html, 'What needs to happen next')).toBeVisible()
    expect(
      getByText(
        html,
        new RegExp(`This should include interviewing ${TEST_PRISONER.firstName} ${TEST_PRISONER.lastName}`),
      ),
    ).toBeVisible()
  })

  it('should render page correctly for outcome type "Progress to CSIP"', async () => {
    const mockData = getJourneyDataMock()
    mockData.saferCustodyScreening!.outcomeType = { code: 'CUR', description: 'Progress to CSIP' } as ReferenceData
    const result = await request(app({ journeyData: mockData }))
      .get(URL)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'CSIP referral screening outcome recorded')).toBeVisible()
    expect(getByText(html, 'Progress to CSIP')).toBeVisible()

    expect(getByText(html, 'We’ve updated the status of the referral to “plan pending”.')).toBeVisible()

    expect(queryByText(html, 'What needs to happen next')).not.toBeInTheDocument()
    expect(
      queryByText(
        html,
        new RegExp(`This should include interviewing ${TEST_PRISONER.firstName} ${TEST_PRISONER.lastName}`),
      ),
    ).not.toBeInTheDocument()
  })

  it('should render page correctly for any other outcome type', async () => {
    const mockData = getJourneyDataMock()
    mockData.saferCustodyScreening!.outcomeType = { code: 'AAA', description: 'No further action' } as ReferenceData
    const result = await request(app({ journeyData: mockData }))
      .get(URL)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'CSIP referral screening outcome recorded')).toBeVisible()
    expect(getByText(html, 'No further action')).toBeVisible()

    expect(getByText(html, 'We’ve updated the status of the referral to “no further action”.')).toBeVisible()

    expect(queryByText(html, 'What needs to happen next')).not.toBeInTheDocument()
    expect(
      queryByText(
        html,
        new RegExp(`This should include interviewing ${TEST_PRISONER.firstName} ${TEST_PRISONER.lastName}`),
      ),
    ).not.toBeInTheDocument()
  })
})
