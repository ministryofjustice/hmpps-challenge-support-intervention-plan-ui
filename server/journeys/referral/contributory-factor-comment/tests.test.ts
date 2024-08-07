import { Locals, Request } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../testutils/testRequestCaptor'
import createTestHtmlElement from '../../../testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../testutils/testConstants'

const uuid = uuidV4()
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
        factorType: { code: 'A', description: 'Text' },
      },
      {
        factorType: { code: 'B', description: 'Text for type-B' },
        comment: 'Sample Comment Text',
      },
      {
        factorType: { code: 'C', description: 'Text with a TLA' },
      },
    ],
  },
} as JourneyData

let reqCaptured: TestRequestCaptured
let requestCaptor: (req: Request) => void

const app = (
  {
    journeyData,
    validationErrors,
  }: {
    journeyData?: JourneyData
    validationErrors?: Locals['validationErrors']
  } = { journeyData: journeyDataMock, validationErrors: undefined },
) => {
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

describe('GET /referral/:factorTypeCode-comment', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/referral/a-comment`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Add a comment on text factors (optional)')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /add a comment on text factors \(optional\)/i }) as HTMLInputElement).value,
    ).toEqual('')
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(app()).get(`/${uuid}/referral/b-comment`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Add a comment on text for type-B factors (optional)')).toBeVisible()
    expect(
      (
        getByRole(html, 'textbox', {
          name: /add a comment on text for type-b factors \(optional\)/i,
        }) as HTMLInputElement
      ).value,
    ).toEqual('Sample Comment Text')
  })

  it('preserve acronym uppercase in factor type description text', async () => {
    const result = await request(app()).get(`/${uuid}/referral/c-comment`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Add a comment on text with a TLA factors (optional)')).toBeVisible()
  })
})

describe('POST /referral/:factorTypeCode-comment', () => {
  it('redirect to /referral/contributory-factors-comments, save comment on valid request', async () => {
    await request(app())
      .post(`/${uuid}/referral/a-comment`)
      .type('form')
      .send({ comment: 'Sample Text' })
      .expect(302)
      .expect('Location', 'contributory-factors-comments')

    expect(reqCaptured.journeyData().referral?.contributoryFactors![0]!.comment).toEqual('Sample Text')
  })

  it('redirect to /referral/contributory-factors-comments, delete comment on empty submission', async () => {
    await request(app())
      .post(`/${uuid}/referral/b-comment`)
      .type('form')
      .send({ comment: ' ' })
      .expect(302)
      .expect('Location', 'contributory-factors-comments')

    expect(reqCaptured.journeyData().referral?.contributoryFactors![1]!.comment).toBeUndefined()
  })

  it('redirect to go back and set validation errors if comment exceeds 4000 characters', async () => {
    await request(app())
      .post(`/${uuid}/referral/a-comment`)
      .type('form')
      .send({ comment: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      comment: ['Description must be 4,000 characters or less'],
    })
  })
})
