import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getAllByRole, getAllByText, getByRole, getByText, queryByAttribute, queryByRole } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor, { TestRequestCaptured } from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'
import { ReferenceData, ReferenceDataType } from '../../../@types/csip/csipApiTypes'

const uuid = uuidv4()
const csipApiService = {
  getReferenceData: (_: Request, domain: ReferenceDataType) => {
    switch (domain) {
      case 'outcome-type':
        return [
          { code: 'NFA', description: 'No further action' },
          { code: 'AAA', description: 'Another option' },
        ]
      default:
        return []
    }
  },
} as unknown as CsipApiService
const journeyDataProactive = {
  prisoner: TEST_PRISONER,
  referral: {},
  saferCustodyScreening: {},
  instanceUnixEpoch: 0,
  csipRecord: {
    recordUuid: '02e5854f-f7b1-4c56-bec8-69e390eb8550',
    prisonNumber: 'G8563UA',
    prisonCodeWhenRecorded: 'LEI',
    createdAt: '2024-07-22T11:21:48',
    createdBy: 'AHUMAN_GEN',
    createdByDisplayName: 'A Human',
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
  } = { journeyData: journeyDataProactive, validationErrors: undefined },
) => {
  ;[reqCaptured, requestCaptor] = testRequestCaptor(journeyData, uuid)
  return appWithAllRoutes({
    services: { csipApiService },
    uuid,
    requestCaptor,
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

const EXPECTED_OUTCOME_ERROR_MSG = 'Select the outcome of Safer Custody screening'
const EXPECTED_REASON_ERROR_MSG = 'Enter a description of the reasons for this decision'
const EXPECTED_REASON_ERROR_MSG_LENGTH = 'Description must be 4,000 characters or less'

describe('tests', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/screen/screen`).expect(200).expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)

    expect(getByRole(html, 'heading', { name: /Screen a CSIP referral/ })).toBeVisible()
    expect(getByRole(html, 'textbox', { name: /Describe the reasons for this decision/ })).toBeVisible()

    const radios = getAllByRole(html, 'radio')
    radios.forEach(radio => {
      expect(radio).not.toBeChecked()
    })

    expect(getByRole(html, 'button', { name: /continue/i })).toBeVisible()

    expect(queryByAttribute('class', html, 'govuk-breadcrumbs')).toBeNull()
    expect(queryByRole(html, 'link', { name: 'Back' })).toBeNull()
  })

  it('should prepopulate values from journeyData ', async () => {
    const data = {
      journeyData: {
        instanceUnixEpoch: 0,
        saferCustodyScreening: {
          outcomeType: { code: 'NFA', description: 'No further action' } as ReferenceData,
          reasonForDecision: 'idklol',
        },
      },
    }

    const result = await request(app(data)).get(`/${uuid}/screen/screen`).expect(200).expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)

    const radios = getAllByRole(html, 'radio')

    expect(radios[0]).not.toBeChecked()
    expect(radios[1]).toBeChecked()

    expect(html.getElementsByTagName('textarea')[0]!.value).toBe('idklol')

    expect(getByRole(html, 'button', { name: /continue/i })).toBeVisible()
  })

  it('should display errors on posting empty data', async () => {
    await request(app()).post(`/${uuid}/screen/screen`).send({}).expect('Location', `/`)

    const errors = reqCaptured.validationErrors()

    const result = await request(app({ journeyData: journeyDataProactive, validationErrors: errors }))
      .get(`/${uuid}/screen/screen`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)

    expect(getAllByText(html, EXPECTED_OUTCOME_ERROR_MSG)).toHaveLength(2)
    expect(getAllByText(html, EXPECTED_REASON_ERROR_MSG)).toHaveLength(2)

    expect(errors).toEqual({
      outcomeType: [EXPECTED_OUTCOME_ERROR_MSG],
      reasonForDecision: [EXPECTED_REASON_ERROR_MSG],
    })
  })

  it('should display errors on posting invalid data', async () => {
    await request(app())
      .post(`/${uuid}/screen/screen`)
      .send({
        outcomeType: 'INVALID',
        reasonForDecision: 'Posting a value for outcomeType that should not be accepted',
      })
      .expect('Location', `/`)

    const errors = reqCaptured.validationErrors()

    const result = await request(app({ journeyData: journeyDataProactive, validationErrors: errors }))
      .get(`/${uuid}/screen/screen`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)

    expect(getByText(html, 'There is a problem')).toBeVisible()

    expect(getAllByText(html, EXPECTED_OUTCOME_ERROR_MSG)).toHaveLength(2)

    expect(errors).toEqual({
      outcomeType: [EXPECTED_OUTCOME_ERROR_MSG],
    })
  })

  it('should display an error on posting over 4000 characters in reason', async () => {
    await request(app())
      .post(`/${uuid}/screen/screen`)
      .send({
        reasonForDecision: 'o'.repeat(4001),
        outcomeType: 'NFA',
      })
      .expect('Location', `/`)

    const errors = reqCaptured.validationErrors()

    const result = await request(app({ journeyData: journeyDataProactive, validationErrors: errors }))
      .get(`/${uuid}/screen/screen`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getAllByText(html, EXPECTED_REASON_ERROR_MSG_LENGTH)).toHaveLength(2)

    expect(errors).toEqual({
      reasonForDecision: [EXPECTED_REASON_ERROR_MSG_LENGTH],
    })
  })

  it('should return a 200 on posting valid data and redirect to check answers', async () => {
    await request(app())
      .post(`/${uuid}/screen/screen`)
      .send({ outcomeType: 'NFA', reasonForDecision: 'no action needed' })
      .expect(302)
      .expect('Location', 'check-answers')
  })
})
