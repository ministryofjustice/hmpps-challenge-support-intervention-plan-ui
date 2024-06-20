import { Express } from 'express'
import request from 'supertest'
import { getByRole } from '@testing-library/dom'
import { appWithAllRoutes } from '../../routes/testutils/appSetup'

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
  it('should work', () => {
    return request(app)
      .get('/referral')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        const div = document.createElement('div')
        div.innerHTML = res.text
        document.body.appendChild(div)
        const heading = getByRole(document.documentElement, 'heading')
        expect(heading).toBeVisible()
        expect(heading).toHaveTextContent(/referrals is under construction/i)
      })
  })
})
