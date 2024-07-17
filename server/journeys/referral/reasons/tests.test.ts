import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor, { TestRequestCaptured } from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'

const TEST_PATH = 'referral/reasons'
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
    descriptionOfConcern: 'Sample Description Text',
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

describe('GET /referral/reasons - Proactive', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'What reasons have been given for the behaviour?')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /what reasons have been given for the behaviour/i }) as HTMLInputElement)
        .value,
    ).toEqual('')
    expect(result.text).toContain('by the prisoner during conversations with staff members')
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataProactive,
          referral: {
            ...journeyDataProactive.referral,
            knownReasons: 'Sample Reasons Text',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'What reasons have been given for the behaviour?')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /what reasons have been given for the behaviour/i }) as HTMLInputElement)
        .value,
    ).toEqual('Sample Reasons Text')
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({
        journeyData: journeyDataProactive,
        validationErrors: { propertyName: ['Error message'] },
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('GET /referral/reasons - Reactive', () => {
  it('render page', async () => {
    const result = await request(app({ journeyData: journeyDataReactive }))
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'What reasons have been given for the incident?')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /what reasons have been given for the incident/i }) as HTMLInputElement)
        .value,
    ).toEqual('')
    expect(result.text).toContain('by the prisoner during conversations after the incident')
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataReactive,
          referral: {
            ...journeyDataReactive.referral,
            knownReasons: 'Sample Reasons Text',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'What reasons have been given for the incident?')).toBeVisible()
    expect(
      (getByRole(html, 'textbox', { name: /what reasons have been given for the incident/i }) as HTMLInputElement)
        .value,
    ).toEqual('Sample Reasons Text')
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({
        journeyData: journeyDataReactive,
        validationErrors: { propertyName: ['Error message'] },
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/reasons - Proactive', () => {
  it('redirect to /referral/contributory-factors, save Known Reasons on valid request', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: 'Sample Reasons Text' })
      .expect(302)
      .expect('Location', 'contributory-factors')

    expect(reqCaptured.journeyData().referral?.knownReasons).toEqual('Sample Reasons Text')
  })

  it('redirect to go back and set validation errors if Known Reasons is missing', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      knownReasons: ['Enter the reasons given for the behaviour'],
    })
  })

  it('redirect to go back and set validation errors if Known Reasons is empty', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: '  ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      knownReasons: ['Enter the reasons given for the behaviour'],
    })
  })

  it('redirect to go back and set validation errors if Known Reasons exceeds 4000 characters', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      knownReasons: ['Description must be 4,000 characters or less'],
    })
  })
})

describe('POST /referral/reasons - Reactive', () => {
  it('redirect to /referral/contributory-factors, save Known Reasons on valid request', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: 'Sample Reasons Text' })
      .expect(302)
      .expect('Location', 'contributory-factors')

    expect(reqCaptured.journeyData().referral?.knownReasons).toEqual('Sample Reasons Text')
  })

  it('redirect to go back and set validation errors if Known Reasons is missing', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      knownReasons: ['Enter the reasons given for the incident'],
    })
  })

  it('redirect to go back and set validation errors if Known Reasons is empty', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: '  ' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      knownReasons: ['Enter the reasons given for the incident'],
    })
  })

  it('redirect to go back and set validation errors if Known Reasons exceeds 4000 characters', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({ knownReasons: 'n'.repeat(4001) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      knownReasons: ['Description must be 4,000 characters or less'],
    })
  })
})
