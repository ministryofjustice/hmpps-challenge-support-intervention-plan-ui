import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import type Prisoner from '../../../services/prisonerSearch/prisoner'

let app: Express
const uuid = uuidv4()
const prisonerSearchService = {
  getPrisonerDetails: async () => {
    return {
      cellLocation: '',
      firstName: 'Bob',
      lastName: 'Marley',
      prisonerNumber: 'ABC123'
    } as Prisoner
  }
} as unknown as PrisonerSearchService
beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      prisonerSearchService,
    },
    uuid
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('tests', () => {
  it('should redirect to first stage of referral journey when going to start uri', done => {
    request(app)
      .get(`/prisoners/ABC123/referral/start`)
      .expect(302)
      .redirects(1)
      .expect('Location', /referral\/on-behalf-of/)
      .end(err => {
        if (err) {
          done(err)
          return
        }
        done()
      })
  })
})
