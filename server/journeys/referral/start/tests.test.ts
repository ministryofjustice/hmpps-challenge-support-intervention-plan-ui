import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import type Prisoner from '../../../services/prisonerSearch/prisoner'
import { SanitisedError } from '../../../sanitisedError'
import type CsipApiService from '../../../services/csipApi/csipApiService'

let app: Express
const uuid = uuidv4()
const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const prisonerSearchService = {
  getPrisonerDetails: async () => {
    return {
      cellLocation: '',
      firstName: 'Bob',
      lastName: 'Marley',
      prisonerNumber: 'ABC123',
    } as Prisoner
  },
} as unknown as PrisonerSearchService

const prisonerSearchService404 = {
  getPrisonerDetails: async () => {
    const err = new Error('404') as SanitisedError
    err.status = 404
    throw err
  },
} as unknown as PrisonerSearchService
beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      csipApiService,
      prisonerSearchService,
    },
    uuid,
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

  it('should redirect to dps prisoner search page if prisoner not found', done => {
    request(
      appWithAllRoutes({
        services: {
          csipApiService,
          prisonerSearchService: prisonerSearchService404,
        },
        uuid,
      }),
    )
      .get(`/prisoners/ABC123/referral/start`)
      .expect(302)
      .redirects(1)
      .expect('Location', /localhost:3001/)
      .end(err => {
        if (err) {
          done(err)
          return
        }
        done()
      })
  })
})
