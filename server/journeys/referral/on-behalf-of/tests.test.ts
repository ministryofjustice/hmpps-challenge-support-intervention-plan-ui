import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import { getByRole } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'

let app: Express
beforeEach(() => {
  app = appWithAllRoutes({
    services: {},
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('tests', () => {
  it('render on behalf of on get', () => {
    return request(app)
      .get(`/${uuidv4()}/referral/on-behalf-of`)
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        const div = document.createElement('div')
        div.innerHTML = res.text
        document.body.appendChild(div)
        const heading = getByRole(document.documentElement, 'heading')
        expect(heading).toBeVisible()
        expect(heading).toHaveTextContent(/on behalf of/i)
      })
  })

  it('should post correctly to on behalf of', () => {
    return request(app)
      .post('/referral/on-behalf-of')
      .send({})
      .expect(302)
      .expect(res => {
        console.log(`res.text: ${res.text}`)
      })
  })
})
