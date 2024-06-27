import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import { appWithAllRoutes, user } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { JourneyData } from '../../../@types/express'
import journeyDataCaptor from '../../../routes/testutils/journeyDataCaptor'
import { HmppsUser } from '../../../interfaces/hmppsUser'

const uuid = uuidv4()
let app: Express
const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const journeyData = {} as JourneyData
const requestCaptor = journeyDataCaptor(journeyData, uuid)

beforeEach(() => {
  app = appWithAllRoutes({
    services: { csipApiService },
    requestCaptor,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('POST /referral/area-of-work', () => {
  it('redirect to /referral/proactive-or-reactive on valid request', done => {
    request(app)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'A' })
      .expect(302)
      .expect('Location', `/referral/proactive-or-reactive`)
      .end(err => {
        expect(journeyData.referral?.refererArea).toEqual({ code: 'A', description: 'TEXT' })
        expect(journeyData.referral?.referredBy).toEqual('First Last')
        done(err)
      })
  })

  it('truncate user name to 240 characters and save to journeyData on valid request', done => {
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
    request(appWithLongUserName)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'A' })
      .end(err => {
        expect(journeyData.referral?.referredBy).toEqual('n'.repeat(240))
        done(err)
      })
  })

  it('redirect to go back if submitted area code is invalid', done => {
    request(app)
      .post(`/${uuid}/referral/area-of-work`)
      .type('form')
      .send({ areaOfWork: 'INVALID' })
      .expect(302)
      .expect('Location', `/`)
      .end(done)
  })
})
