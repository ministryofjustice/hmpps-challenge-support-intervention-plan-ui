import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'

const uuid = uuidv4()
const journeyDataProactive = {
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
  },
} as JourneyData
const journeyDataReactive = {
  ...journeyDataProactive,
  referral: {
    ...journeyDataProactive.referral,
    isProactiveReferral: false,
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
    services: {},
    uuid,
    requestCaptor,
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/description - Proactive', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/referral/description`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Describe the behaviour and concerns')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /describe the behaviour and concerns/i }) as HTMLInputElement).value,
    ).toEqual('')
    expect(result.text).toContain('a summary of the concerns')
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataProactive,
          referral: {
            ...journeyDataProactive.referral,
            descriptionOfConcern: 'Sample Description Text',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/referral/description`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Describe the behaviour and concerns')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /describe the behaviour and concerns/i }) as HTMLInputElement).value,
    ).toEqual('Sample Description Text')
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({
        journeyData: journeyDataProactive,
        validationErrors: { propertyName: ['Error message'] },
      }),
    )
      .get(`/${uuid}/referral/description`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('GET /referral/description - Reactive', () => {
  it('render page', async () => {
    const result = await request(app({ journeyData: journeyDataReactive }))
      .get(`/${uuid}/referral/description`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Describe the incident and concerns')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /describe the incident and concerns/i }) as HTMLInputElement).value,
    ).toEqual('')
    expect(result.text).toContain('a summary of the incident')
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataReactive,
          referral: {
            ...journeyDataReactive.referral,
            descriptionOfConcern: 'Sample Description Text',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/referral/description`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Describe the incident and concerns')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /describe the incident and concerns/i }) as HTMLInputElement).value,
    ).toEqual('Sample Description Text')
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({
        journeyData: journeyDataReactive,
        validationErrors: { propertyName: ['Error message'] },
      }),
    )
      .get(`/${uuid}/referral/description`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/description - Proactive', () => {
  it('redirect to /referral/reasons, save Description of Concern on valid request', async () => {
    await request(app())
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: 'Sample Concern Text' })
      .expect(302)
      .expect('Location', 'reasons')

    expect(reqCaptured.journeyData().referral?.descriptionOfConcern).toEqual('Sample Concern Text')
  })

  it('redirect to go back and set validation errors if Description of Concern is missing', async () => {
    await request(app())
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      descriptionOfConcern: ['Enter a description of the behaviour and concerns'],
    })
  })

  it('redirect to go back and set validation errors if Description of Concern is empty', async () => {
    await request(app())
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: '  ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      descriptionOfConcern: ['Enter a description of the behaviour and concerns'],
    })
  })

  it('redirect to go back and set validation errors if Description of Concern exceeds 4000 characters', async () => {
    await request(app())
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      descriptionOfConcern: ['Description must be 4,000 characters or less'],
    })
  })
})

describe('POST /referral/description - Reactive', () => {
  it('redirect to /referral/reasons, save Description of Concern on valid request', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: 'Sample Concern Text' })
      .expect(302)
      .expect('Location', 'reasons')

    expect(reqCaptured.journeyData().referral?.descriptionOfConcern).toEqual('Sample Concern Text')
  })

  it('redirect to go back and set validation errors if Description of Concern is missing', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      descriptionOfConcern: ['Enter a description of the incident and concerns'],
    })
  })

  it('redirect to go back and set validation errors if Description of Concern is empty', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: '  ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      descriptionOfConcern: ['Enter a description of the incident and concerns'],
    })
  })

  it('redirect to go back and set validation errors if Description of Concern exceeds 4000 characters', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/description`)
      .type('form')
      .send({ descriptionOfConcern: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      descriptionOfConcern: ['Description must be 4,000 characters or less'],
    })
  })
})
