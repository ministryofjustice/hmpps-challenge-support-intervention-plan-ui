import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import { findByText, getByRole, getByText, queryByAttribute } from '@testing-library/dom'
import { userEvent } from '@testing-library/user-event'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import { schema } from './schemas'

let app: Express
const uuid = uuidv4()
beforeEach(() => {
  app = appWithAllRoutes({
    uuid,
    journeyData: {
      prisoner: {
        cellLocation: 'Foo prison',
        firstName: 'David',
        lastName: 'Jones',
        prisonerNumber: 'ABCABC',
      },
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('tests', () => {
  it('render on behalf of on get', done => {
    request(app)
      .get(`/${uuid}/referral/on-behalf-of`)
      .expect(200)
      .expect('Content-Type', /html/)
      .end(async (err, res) => {
        if (err) {
          done(err)
          return
        }
        const div = document.createElement('div')
        div.innerHTML = res.text
        document.body.appendChild(div)
        const topLevelElement = document.documentElement
        const user = userEvent.setup()
        expect(getByRole(topLevelElement, 'heading', { name: /make a csip referral/i })).toBeVisible()
        expect(getByText(topLevelElement, /help with csip referrals/i)).toBeVisible()

        await user.click(topLevelElement.querySelector('summary') as HTMLElement)
        expect(await findByText(topLevelElement, /check your local guidance/i)).toBeVisible()

        expect(getByText(topLevelElement, /help with csip referrals/i)).toBeVisible()
        expect(getByText(topLevelElement, /you can use this service to refer david jones/i)).toBeVisible()
        expect(getByRole(topLevelElement, 'radio', { name: /yes/i })).toBeVisible()
        expect(getByRole(topLevelElement, 'radio', { name: /no/i })).toBeVisible()
        expect(getByRole(topLevelElement, 'button', { name: /continue/i })).toBeVisible()
        expect(queryByAttribute('class', topLevelElement, 'govuk-breadcrumbs')).toBeNull()
        expect(getByRole(topLevelElement, 'link', { name: 'Back' })).toBeVisible()

        done()
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
    const generatedUuid = uuidv4()
    request(app)
      .post(`/${generatedUuid}/referral/on-behalf-of`)
      .send({ isOnBehalfOfReferral: true })
      .redirects(1)
      .expect('Location', /\/referral\/referrer/)
      .end(() => {
        done()
      })
  })

  it('should return a 200 on posting good data', done => {
    const generatedUuid = uuidv4()
    request(app)
      .post(`/${generatedUuid}/referral/on-behalf-of`)
      .send({ isOnBehalfOfReferral: false })
      .redirects(1)
      .expect('Location', /referral\/area-of-work/)
      .end(async err => {
        if (err) {
          done(err)
          return
        }
        done()
      })
  })

  it('should display validation errors correctly', done => {
    const errors = schema.safeParse({ isOnBehalfOfReferral: '' }).error?.flatten()?.fieldErrors
    const onBehalfOfError = errors?.['isOnBehalfOfReferral']?.[0]
    if (!onBehalfOfError) {
      done(
        `Should have raised an error when parsing empty object for on behalf of schema for value ${JSON.stringify({ isOnBehalfOfReferral: '' })}`,
      )
      return
    }
    const localUuid = uuidv4()
    const app2 = appWithAllRoutes({
      services: {},
      uuid: localUuid,
      validationErrors: errors,
    })
    request(app2)
      .get(`/${localUuid}/referral/on-behalf-of`)
      .end(async (err, res) => {
        if (err) {
          done(err)
          return
        }
        const div = document.createElement('div')
        div.innerHTML = res.text
        document.body.appendChild(div)
        const topLevelElement = document.documentElement
        const error = getByRole(topLevelElement, 'link', { name: onBehalfOfError })
        expect(error).toBeVisible()
        done()
      })
  })
})
