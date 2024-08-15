import { Express } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { getByRole } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../testutils/appSetup'
import type PrisonerSearchService from '../../../../services/prisonerSearch/prisonerSearchService'
import { SanitisedError } from '../../../../sanitisedError'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import createTestHtmlElement from '../../../../testutils/createTestHtmlElement'
import { TEST_PRISONER } from '../../../../testutils/testConstants'

let app: Express
const uuid = uuidV4()
const csipApiService = {
  getReferenceData: () => [
    { code: 'A', description: 'TEXT' },
    { code: 'B', description: 'TEXT2' },
  ],
} as unknown as CsipApiService
const prisonerSearchService = {
  getPrisonerDetails: async () => TEST_PRISONER,
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
  it('should redirect to first stage of referral journey when going to start uri', async () => {
    await request(app)
      .get(`/prisoners/ABC123/referral/start`)
      .expect(302)
      .redirects(1)
      .expect('Location', /referral\/on-behalf-of/)
  })

  it('should redirect to dps prisoner search page if prisoner not found', async () => {
    await request(
      appWithAllRoutes({
        services: {
          csipApiService,
          prisonerSearchService: {
            getPrisonerDetails: async () => {
              const err = new Error('404') as SanitisedError
              err.status = 404
              throw err
            },
          } as unknown as PrisonerSearchService,
        },
        uuid,
      }),
    )
      .get(`/prisoners/ABC123/referral/start`)
      .expect(302)
      .redirects(1)
      .expect('Location', /localhost:3001/)
  })

  it('should redirect to error page if 500', async () => {
    const result = await request(
      appWithAllRoutes({
        services: {
          csipApiService,
          prisonerSearchService: {
            getPrisonerDetails: async () => {
              const err = new Error('500') as SanitisedError
              err.status = 500
              err.message = '500 error happened'
              return Promise.reject(err)
            },
          } as unknown as PrisonerSearchService,
        },
        uuid,
      }),
    )
      .get(`/${uuid}/prisoners/ABC123/referral/start`)
      .expect(500)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: /500 error happened/i })).toBeVisible()
  })
})
