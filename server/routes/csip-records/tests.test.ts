import { agent as request } from 'supertest'
import { getAllByRole, getByRole, queryAllByText, queryByRole, queryByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../testutils/appSetup'
import createTestHtmlElement from '../testutils/createTestHtmlElement'
import { TEST_PRISONER } from '../testutils/testConstants'
import type CsipApiService from '../../services/csipApi/csipApiService'
import type PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import { CsipRecord } from '../../@types/csip/csipApiTypes'

const TEST_PATH = '/csip-records/de643405-7bc9-4181-9677-db887a41f78d'

const csipRecordMock = {
  createdAt: '2024-08-01T08:43:46.216Z',
  createdBy: 'user.name',
  createdByDisplayName: 'User Name',
  prisonNumber: 'A1111AA',
  recordUuid: 'de643405-7bc9-4181-9677-db887a41f78d',
  referral: {
    referredBy: '<script>alert("Test User")</script>',
    refererArea: { code: 'A', description: '<script>alert("Area")</script>' },
    isProactiveReferral: true,
    incidentLocation: { code: 'A', description: '<script>alert("Location")</script>' },
    incidentType: { code: 'A', description: '<script>alert("IncidentType")</script>' },
    incidentDate: '2024-12-25',
    incidentTime: '23:59:00',
    incidentInvolvement: { code: 'A', description: '<script>alert("Involvement")</script>' },
    isStaffAssaulted: true,
    assaultedStaffName: '<script>alert("Staff Name")</script>',
    descriptionOfConcern: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('concerns');</script>
    
    <button>this button should be escaped</button>`,
    knownReasons: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('xss');</script>
    
    <button>also should be escaped</button>`,
    contributoryFactors: [
      {
        factorType: { code: 'A', description: 'Text' },
      },
      {
        factorType: { code: 'B', description: '<script>alert("Text for type-B")</script>' },
        comment: `Text

        • Bullet 1
        • Bullet 2
        • Bullet 3
        
        Paragraph
        
        <script>alert('xss');</script>
        
        <button>factor comment button should be escaped</button>`,
      },
      {
        factorType: { code: 'C', description: 'Text with a TLA' },
      },
    ],
    isSaferCustodyTeamInformed: 'YES',
    otherInformation: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('xss');</script>
    
    <button>otherinfo button should be escaped</button>`,
  },
} as CsipRecord

const app = (csipRecord: CsipRecord) => {
  return appWithAllRoutes({
    services: {
      csipApiService: {
        getCsipRecord: () => csipRecord,
      } as unknown as CsipApiService,
      prisonerSearchService: {
        getPrisonerDetails: async () => TEST_PRISONER,
      } as unknown as PrisonerSearchService,
    },
    uuid: 'uuid',
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /csip-records/:recordUuid', () => {
  it('render page for CSIP record with proactive referral', async () => {
    const result = await request(app(csipRecordMock)).get(TEST_PATH).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: 'Behaviour details' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Behaviour involvement' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Behaviour description' })).toBeVisible()

    expect(queryByText(html, csipRecordMock.referral!.referredBy!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.refererArea!.description!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.incidentLocation!.description!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.incidentType!.description!)).toBeVisible()
    expect(queryByText(html, '25 December 2024')).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.incidentInvolvement!.description!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.assaultedStaffName!)).toBeVisible()
    // We should have script tags as plain text
    expect(queryAllByText(html, /<script>alert\('xss'\);<\/script>/i)).toHaveLength(3)
    // But not as actual script tags
    expect(
      [...html.querySelectorAll('script')].filter(el => (el as HTMLScriptElement)?.textContent?.includes('xss')),
    ).toHaveLength(0)
    expect(queryByRole(html, 'button', { name: /this button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /also should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /factor comment button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /otherinfo button should be escaped/i })).not.toBeInTheDocument()
    const lines = (String(csipRecordMock.referral!.descriptionOfConcern!).match(/\n/g) || '').length
    queryAllByText(html, /<script>alert\('concerns'\);<\/script>/i).forEach(el => {
      expect(el.querySelectorAll('br')).toHaveLength(lines)
    })
    expect(queryByText(html, 'Comment on <script>alert("text for type-b")</script> factors')).toBeVisible()

    const actionButtons = getAllByRole(html, 'button', { name: 'Screen referral' })
    expect(actionButtons).toHaveLength(2)
    actionButtons.forEach(actionButton =>
      expect((actionButton as HTMLLinkElement).href).toMatch(
        /\/csip-record\/de643405-7bc9-4181-9677-db887a41f78d\/screen\/start/,
      ),
    )
  })

  it('render page for CSIP record with reactive referral', async () => {
    const result = await request(
      app({
        ...csipRecordMock,
        referral: {
          ...csipRecordMock.referral,
          isProactiveReferral: false,
        },
      }),
    )
      .get(TEST_PATH)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: 'Incident details' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Incident involvement' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Incident description' })).toBeVisible()

    expect(queryByText(html, csipRecordMock.referral!.referredBy!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.refererArea!.description!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.incidentLocation!.description!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.incidentType!.description!)).toBeVisible()
    expect(queryByText(html, '25 December 2024')).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.incidentInvolvement!.description!)).toBeVisible()
    expect(queryByText(html, csipRecordMock.referral!.assaultedStaffName!)).toBeVisible()
    expect(queryByText(html, 'Comment on <script>alert("text for type-b")</script> factors')).toBeVisible()
    const lines = (String(csipRecordMock.referral!.descriptionOfConcern!).match(/\n/g) || '').length
    queryAllByText(html, /<script>alert\('concerns'\);<\/script>/i).forEach(el => {
      expect(el.querySelectorAll('br')).toHaveLength(lines)
    })
    // We should have script tags as plain text
    expect(queryAllByText(html, /<script>alert\('xss'\);<\/script>/i)).toHaveLength(3)
    // But not as actual script tags
    expect(
      [...html.querySelectorAll('script')].filter(el => (el as HTMLScriptElement)?.textContent?.includes('xss')),
    ).toHaveLength(0)
    expect(queryByRole(html, 'button', { name: /this button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /also should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /factor comment button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /otherinfo button should be escaped/i })).not.toBeInTheDocument()

    const actionButtons = getAllByRole(html, 'button', { name: 'Screen referral' })
    expect(actionButtons).toHaveLength(2)
    actionButtons.forEach(actionButton =>
      expect((actionButton as HTMLLinkElement).href).toMatch(
        /\/csip-record\/de643405-7bc9-4181-9677-db887a41f78d\/screen\/start/,
      ),
    )
  })
})
