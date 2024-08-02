import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { SanitisedError } from '../../../sanitisedError'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'

const TEST_PATH = 'record-investigation/start'
let app: Express
const uuid = uuidv4()
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
  it('should redirect to first stage of journey when going to start uri', async () => {
    await request(app)
      .get(`/csip-record/${uuid}/${TEST_PATH}`)
      .expect(302)
      .redirects(1)
      .expect('Location', /record-investigation$/)
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
      .get(`/csip-record/${uuid}/${TEST_PATH}`)
      .expect(302)
      .redirects(1)
      .expect('Location', /\/csip-record\/([0-9A-Fa-f]+-?)+/)
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
      .get(`/csip-record/${uuid}/${TEST_PATH}`)
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
      .get(`/${uuidv4()}/csip-record/${uuid}/${TEST_PATH}`)
      .expect(500)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: /500 error happened/i })).toBeVisible()
  })
})
