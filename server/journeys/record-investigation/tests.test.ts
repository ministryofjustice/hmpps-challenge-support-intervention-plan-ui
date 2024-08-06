import request from 'supertest'
import { getAllByText, getByRole, getByText, queryByRole } from '@testing-library/dom'
import { v4 as uuidV4 } from 'uuid'
import { appWithAllRoutes } from '../../routes/testutils/appSetup'
import createTestHtmlElement from '../../testutils/createTestHtmlElement'
import { TEST_PRISONER } from '../../testutils/testConstants'
import { JourneyData } from '../../@types/express'
import testRequestCaptor from '../../testutils/testRequestCaptor'

const TEST_PATH = 'record-investigation'
const uuid = uuidV4()

const journeyDataMock = {
  prisoner: TEST_PRISONER,
  investigation: {},
  instanceUnixEpoch: 0,
  csipRecord: {
    logCode: 'LEI123',
  },
} as JourneyData

const app = (journeyData: JourneyData) => {
  return appWithAllRoutes({
    services: {},
    uuid,
    requestCaptor: testRequestCaptor(journeyData, uuid)[1],
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /record-investigation', () => {
  it('render page for incomplete investigation', async () => {
    const result = await request(app(journeyDataMock))
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: 'Record a CSIP investigation' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: '1. Log interviews' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: '2. Enter findings' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: '3. Submit report' })).toBeVisible()
    expect(getByText(html, 'LEI123')).toBeVisible()
    expect((getByRole(html, 'link', { name: 'Interview details' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/interview-details$/,
    )
    expect((getByRole(html, 'link', { name: 'Staff involved in the investigation' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/staff-involved$/,
    )
    expect((getByRole(html, 'link', { name: 'Why the behaviour occurred' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/why-behaviour-occurred$/,
    )
    expect((getByRole(html, 'link', { name: 'Evidence secured' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/evidence-secured$/,
    )
    expect((getByRole(html, 'link', { name: 'Usual behaviour presentation' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/usual-behaviour-presentation$/,
    )
    expect((getByRole(html, 'link', { name: 'Test Person’s triggers' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/triggers$/,
    )
    expect((getByRole(html, 'link', { name: 'Protective factors' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/protective-factors$/,
    )
    expect(queryByRole(html, 'link', { name: 'Check and submit report' })).not.toBeInTheDocument()
    expect(getAllByText(html, 'Incomplete')).toHaveLength(7)
    expect(getByText(html, 'Cannot start yet')).toBeVisible()
  })

  it('render page for completed investigation', async () => {
    const result = await request(
      app({
        ...journeyDataMock,
        investigation: {
          interviews: [],
          staffInvolved: 't',
          occurrenceReason: 't',
          evidenceSecured: 't',
          personsUsualBehaviour: 't',
          personsTrigger: 't',
          protectiveFactors: 't',
        },
      } as JourneyData),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: 'Record a CSIP investigation' })).toBeVisible()
    expect((getByRole(html, 'link', { name: 'Check and submit report' }) as HTMLLinkElement).href).toMatch(
      /record-investigation\/check-answers$/,
    )
    expect(getAllByText(html, 'Completed')).toHaveLength(7)
    expect(getByText(html, 'Incomplete')).toBeVisible()
  })

  it('render page for person with last name ending in s', async () => {
    const result = await request(
      app({
        ...journeyDataMock,
        prisoner: {
          ...TEST_PRISONER,
          lastName: 'Persons',
        },
      } as JourneyData),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'link', { name: 'Test Persons’ triggers' })).toBeVisible()
  })
})
