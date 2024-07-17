import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes, user } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor, { TestRequestCaptured } from '../../../routes/testutils/testRequestCaptor'
import { HmppsUser } from '../../../interfaces/hmppsUser'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'

const uuid = uuidv4()
const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const journeyDataMock = () =>
  ({
    prisoner: TEST_PRISONER,
    referral: {
      subJourney: {
        isOnBehalfOfReferral: false,
      },
    },
  }) as JourneyData
let reqCaptured: TestRequestCaptured
let requestCaptor: (req: Request) => void

const app = (
  {
    journeyData,
    validationErrors,
    userSupplier,
  }: {
    journeyData?: JourneyData
    validationErrors?: Locals['validationErrors']
    userSupplier?: () => HmppsUser
  } = { journeyData: journeyDataMock(), validationErrors: undefined },
) => {
  ;[reqCaptured, requestCaptor] = testRequestCaptor(journeyData, uuid)
  return appWithAllRoutes({
    services: { csipApiService },
    uuid,
    requestCaptor,
    validationErrors,
    ...(userSupplier ? { userSupplier } : {}),
  })
}
afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/area-of-work', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/referral/area-of-work`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Which area do you work in?')).toBeVisible()
    expect((getByRole(html, 'option', { name: 'Select area' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock(),
          referral: { ...journeyDataMock().referral, refererArea: { code: 'A', description: 'TEXT' } },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/referral/area-of-work`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect((getByRole(html, 'option', { name: 'Select area' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({ journeyData: journeyDataMock(), validationErrors: { propertyName: ['Error message'] } }),
    )
      .get(`/${uuid}/referral/area-of-work`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'Which area do you work in?')).toBeVisible()
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/area-of-work', () => {
  it('redirect to /referral/proactive-or-reactive, save refererArea and referredBy on valid request', async () => {
    await request(app())
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'A' })
      .expect(302)
      .expect('Location', 'proactive-or-reactive')

    expect(reqCaptured.journeyData().referral?.refererArea).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.referredBy).toEqual('First Last')
    expect(reqCaptured.journeyData().referral?.isOnBehalfOfReferral).toEqual(false)
    expect(reqCaptured.journeyData().referral?.subJourney).toBeUndefined()
  })

  it('truncate user name to 240 characters and save to journeyData on valid request', async () => {
    const userSupplier = () =>
      ({
        ...user,
        displayName: 'n'.repeat(241),
      }) as HmppsUser

    await request(
      app({
        journeyData: journeyDataMock(),
        userSupplier,
      }),
    )
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'A' })

    expect(reqCaptured.journeyData().referral?.referredBy).toEqual('n'.repeat(240))
  })

  it('redirect to go back and set validation errors if submitted area code is missing', async () => {
    await request(app())
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ['Select your area of work'] })
  })

  it('redirect to go back and set validation errors if submitted area code does not exist or is inactive', async () => {
    await request(app())
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'INVALID' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ['Select your area of work'] })
  })
})
