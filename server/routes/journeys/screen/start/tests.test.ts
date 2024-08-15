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
  getCsipRecord: () => {
    return {
      prisonNumber: 'ABCD1234',
    }
  },
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
  it('should redirect to first stage of screen journey when going to start uri', async () => {
    await request(app)
      .get(`/csip-record/${uuid}/screen/start`)
      .expect(302)
      .redirects(1)
      .expect('Location', /screen/)
  })

  it('should redirect to CSIP overview page if prisoner not found', async () => {
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
      .get(`/csip-record/${uuid}/screen/start`)
      .expect(302)
      .redirects(1)
      .expect('Location', /\/csip-records\/([0-9A-Fa-f]+-?)+/)
  })

  it('should redirect to home page if csip record not found', async () => {
    await request(
      appWithAllRoutes({
        services: {
          prisonerSearchService,
          csipApiService: {
            getCsipRecord: async () => {
              const err = new Error('404') as SanitisedError
              err.status = 404
              throw err
            },
          } as unknown as CsipApiService,
        },
        uuid,
      }),
    )
      .get(`/csip-record/${uuid}/screen/start`)
      .expect(302)
      .redirects(1)
      .expect('Location', '/')
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
      .get(`/${uuidV4()}/csip-record/${uuid}/screen/start`)
      .expect(500)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: /500 error happened/i })).toBeVisible()
  })
})
