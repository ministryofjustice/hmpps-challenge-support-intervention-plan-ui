import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor from '../../../routes/testutils/testRequestCaptor'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'

const uuid = uuidv4()

const MOCK_INPUT_RADIO = { code: 'AAA', description: 'Selected radio option' }
const MOCK_INPUT_TEXT_MULTI = `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('concerns');</script>
    
    <button>this button should be escaped</button>`

const MOCK_INPUT_TEXT_MULTI_EXPECTED = `Text<br>\n      <br>\n          • Bullet 1<br>\n          • Bullet 2<br>\n          • Bullet 3<br>\n          <br>\n          Paragraph<br>\n          <br>\n          &lt;script&gt;alert('concerns');&lt;/script&gt;<br>\n          <br>\n          &lt;button&gt;this button should be escaped&lt;/button&gt;`

const journeyDataMock = {
  prisoner: TEST_PRISONER,
  saferCustodyScreening: {
    outcomeType: MOCK_INPUT_RADIO,
    reasonForDecision: MOCK_INPUT_TEXT_MULTI,
  },
} as JourneyData

const URL = `/${uuid}/screen/check-answers`

let requestCaptor: (req: Request) => void

type AppMockSetup = { journeyData?: JourneyData; validationErrors?: Locals['validationErrors'] }
const app = ({ journeyData, validationErrors }: AppMockSetup = { journeyData: journeyDataMock }) => {
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
  })
})
