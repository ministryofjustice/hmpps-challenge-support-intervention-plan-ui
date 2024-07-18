import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'

const uuid = uuidv4()
let app: Express
const journeyData = {
  prisoner: TEST_PRISONER,
} as JourneyData

beforeEach(() => {
  app = appWithAllRoutes({
    services: {},
    uuid,
    journeyData,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/confirmation', () => {
  it('should render page', async () => {
    const result = await request(app).get(`/${uuid}/referral/confirmation`).expect(200).expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: /what happens next/i })).toBeVisible()
    expect(getByText(getByRole(html, 'main'), `${TEST_PRISONER.lastName}, ${TEST_PRISONER.firstName}`)).toBeVisible()
  })
})
