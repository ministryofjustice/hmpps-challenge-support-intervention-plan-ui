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
        const heading = getByRole(div, 'heading')
        expect(heading).toBeVisible()
        expect(heading).toHaveTextContent(/on behalf of/i)
      })
  })

  it('should redirect on posting bad data', done => {
    request(app)
      .post(`/${uuidv4()}/referral/on-behalf-of`)
      .send({})
      .redirects(1)
      .end(async err => {
        if (err) {
          done(err)
        }
        done()
      })
  })

  it('should return a 200 on posting good data', done => {
    request(app)
      .post(`/${uuidv4()}/referral/on-behalf-of`)
      .send({ foo: 'abc' })
      .redirects(1)
      .end(async err => {
        if (err) {
          done(err)
        }
        done()
      })
  })

  it('should display validation errors correctly', done => {
    const app2 = appWithAllRoutes({
      services: {},
      validationErrors: {
        foo: ['you must enter a value between 1-40 characters'],
      },
    })
    request(app2)
      .get(`/${uuidv4()}/referral/on-behalf-of`)
      .end(async (err, res) => {
        if (err) {
          done(err)
        }
        const div = document.createElement('div')
        div.innerHTML = res.text
        document.body.appendChild(div)
        const error = getByRole(div, 'link', { name: /you must enter a value between 1-40 characters/i })
        expect(error).toBeVisible()
        done()
      })
  })
})
