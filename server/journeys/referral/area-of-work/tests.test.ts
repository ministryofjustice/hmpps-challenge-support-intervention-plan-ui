import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import { appWithAllRoutes, user } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor from '../../../routes/testutils/testRequestCaptor'
import { HmppsUser } from '../../../interfaces/hmppsUser'

const uuid = uuidv4()
let app: Express
const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const [reqCaptured, requestCaptor] = testRequestCaptor()

beforeEach(() => {
  app = appWithAllRoutes({
    services: { csipApiService },
    requestCaptor,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/area-of-work', () => {
  it('render page', async () => {
    const result = await request(app).get(`/${uuid}/referral/area-of-work`).expect(200).expect('Content-Type', /html/)
    expect(result.text).toContain('Which area do you work in?')
  })
})

describe('POST /referral/area-of-work', () => {
  it('redirect to /referral/proactive-or-reactive, save refererArea and referredBy on valid request', async () => {
    await request(app)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'A' })
      .expect(302)
      .expect('Location', 'proactive-or-reactive')

    expect(reqCaptured.journeyData().referral?.refererArea).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.referredBy).toEqual('First Last')
  })

  it('truncate user name to 240 characters and save to journeyData on valid request', async () => {
    const userSupplier = () =>
      ({
        ...user,
        displayName: 'n'.repeat(241),
      }) as HmppsUser

    const appWithLongUserName = appWithAllRoutes({
      services: { csipApiService },
      requestCaptor,
      userSupplier,
    })
    await request(appWithLongUserName).post(`/${uuid}/referral/area-of-work`).type('form').send({ areaOfWork: 'A' })

    expect(reqCaptured.journeyData().referral?.referredBy).toEqual('n'.repeat(240))
  })

  it('redirect to go back and set validation errors if submitted area code is missing', async () => {
    await request(app)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: undefined })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ['Select your area of work'] })
  })

  it('redirect to go back and set validation errors if submitted area code is shorter than 1 character', async () => {
    await request(app)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: '' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ['Select your area of work'] })
  })

  it('redirect to go back and set validation errors if submitted area code is longer than 12 character', async () => {
    await request(app)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'n'.repeat(13) })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ['Select your area of work'] })
  })

  it('redirect to go back and set validation errors if submitted area code does not exist or is inactive', async () => {
    await request(app)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'INVALID' })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ areaOfWork: ['Select your area of work'] })
  })
})
