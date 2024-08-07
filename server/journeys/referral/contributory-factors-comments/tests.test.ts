import { Locals } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor from '../../../testutils/testRequestCaptor'
import createTestHtmlElement from '../../../testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../testutils/testConstants'

const TEST_PATH = 'referral/contributory-factors-comments'
const uuid = uuidV4()

const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const journeyDataMock = {
  prisoner: TEST_PRISONER,
  referral: {
    isOnBehalfOfReferral: false,
    referredBy: 'Test User',
    refererArea: { code: 'A', description: 'TEXT' },
    isProactiveReferral: true,
    incidentLocation: { code: 'A', description: 'TEXT' },
    incidentType: { code: 'A', description: 'TEXT' },
    incidentDate: '2024-12-25',
    incidentTime: '23:59',
    descriptionOfConcern: 'Sample Concern Text',
    contributoryFactors: [
      {
        factorType: { code: 'A', description: 'TEXT' },
      },
      {
        factorType: { code: 'B', description: 'TEXT2' },
        comment: 'Sample Comment Text',
      },
    ],
  },
} as JourneyData

const app = (
  {
    journeyData,
    validationErrors,
  }: {
    journeyData?: JourneyData
    validationErrors?: Locals['validationErrors']
  } = { journeyData: journeyDataMock, validationErrors: undefined },
) => {
  return appWithAllRoutes({
    services: { csipApiService },
    uuid,
    requestCaptor: testRequestCaptor(journeyData, uuid)[1],
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/contributory-factors-comments', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Add comments about the contributory factors (optional)')).toBeVisible()
    const addCommentLink = getByRole(html, 'link', { name: 'Add comment on TEXT factor' }) as HTMLLinkElement
    expect(addCommentLink).toBeVisible()
    expect(addCommentLink.href.endsWith('a-comment')).toBeTruthy()
    const editCommentLink = getByRole(html, 'link', { name: 'Edit comment on TEXT2 factor' }) as HTMLLinkElement
    expect(editCommentLink).toBeVisible()
    expect(editCommentLink.href.endsWith('b-comment')).toBeTruthy()
    expect(getByText(html, 'Sample Comment Text')).toBeVisible()
  })

  it('escape html characters in factor type code and description', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            contributoryFactors: [
              {
                factorType: { code: `A<>"'&`, description: `TEXT<>"'&` },
              },
            ],
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    const addCommentLink = getByRole(html, 'link', { name: `Add comment on TEXT<>"'& factor` }) as HTMLLinkElement
    expect(addCommentLink).toBeVisible()
    expect(addCommentLink.href.endsWith(`a%3C%3E%22'&-comment`)).toBeTruthy()
  })
})

describe('POST /referral/contributory-factors-comments', () => {
  it('redirect to /referral/safer-custody', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({})
      .expect(302)
      .expect('Location', 'safer-custody')
  })
})
