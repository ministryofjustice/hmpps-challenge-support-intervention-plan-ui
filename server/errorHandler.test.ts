import type { Express } from 'express'
import { v4 as uuidV4 } from 'uuid'
import request from 'supertest'
import { appWithAllRoutes } from './routes/testutils/appSetup'

let app: Express
let uuid: string

beforeEach(() => {
  uuid = uuidV4()
  app = appWithAllRoutes({
    uuid,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content in dev mode', () => {
    return request(app)
      .get(`/${uuid}/unknown`)
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content in production mode', () => {
    const uuidLocal = uuidV4()
    return request(appWithAllRoutes({ production: true, uuid: uuidLocal }))
      .get(`/${uuidLocal}/unknown`)
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})
