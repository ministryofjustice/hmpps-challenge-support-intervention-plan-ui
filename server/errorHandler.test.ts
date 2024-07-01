import type { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import { appWithAllRoutes } from './routes/testutils/appSetup'

let app: Express
let uuid: string

beforeEach(() => {
  uuid = uuidv4()
  app = appWithAllRoutes({
    uuid,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    return request(app)
      .get(`/${uuid}/unknown`)
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError: Not Found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content without stack in production mode', () => {
    const uuidLocal = uuidv4()
    return request(appWithAllRoutes({ production: true, uuid: uuidLocal }))
      .get(`/${uuidLocal}/unknown`)
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('NotFoundError: Not Found')
      })
  })
})
