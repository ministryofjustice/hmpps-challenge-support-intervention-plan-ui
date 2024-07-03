import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import {
  findByText,
  getAllByRole,
  getAllByText,
  getByRole,
  getByText,
  queryByAttribute,
  queryByRole,
} from '@testing-library/dom'
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
        const radios = getAllByRole(topLevelElement, 'radio')
        radios.forEach(radio => {
          expect(radio).not.toBeChecked()
        })
        expect(getByRole(topLevelElement, 'heading', { name: /make a csip referral/i })).toBeVisible()
        expect(getByText(topLevelElement, /help with csip referrals/i)).toBeVisible()

        await user.click(topLevelElement.querySelector('summary') as HTMLElement)
        expect(await findByText(topLevelElement, /check your local guidance/i)).toBeVisible()

        expect(getByText(topLevelElement, /help with csip referrals/i)).toBeVisible()
        expect(getByText(topLevelElement, /You can use this service to refer David Jones/)).toBeVisible()
        expect(getByRole(topLevelElement, 'radio', { name: /yes/i })).toBeVisible()
        expect(getByRole(topLevelElement, 'radio', { name: /no/i })).toBeVisible()
        expect(getByRole(topLevelElement, 'button', { name: /continue/i })).toBeVisible()
        expect(queryByAttribute('class', topLevelElement, 'govuk-breadcrumbs')).toBeNull()
        expect(queryByRole(topLevelElement, 'link', { name: 'Back' })).toBeNull()

        done()
      })
  })

  it('should prepopulate with yes', async () => {
    const response = await request(
      appWithAllRoutes({
        uuid,
        journeyData: {
          referral: {
            isOnBehalfOfReferral: true,
          },
          prisoner: {
            cellLocation: 'Foo prison',
            firstName: 'David',
            lastName: 'Jones',
            prisonerNumber: 'ABCABC',
          },
        },
      }),
    ).get(`/${uuid}/referral/on-behalf-of`)
    const div = document.createElement('div')
    div.innerHTML = response.text
    document.body.appendChild(div)
    const topLevelElement = document.documentElement
    expect(getByRole(topLevelElement, 'radio', { name: /yes/i })).toBeChecked()
  })

  it('should prepopulate with no', async () => {
    const response = await request(
      appWithAllRoutes({
        uuid,
        journeyData: {
          referral: {
            isOnBehalfOfReferral: false,
          },
          prisoner: {
            cellLocation: 'Foo prison',
            firstName: 'David',
            lastName: 'Jones',
            prisonerNumber: 'ABCABC',
          },
        },
      }),
    ).get(`/${uuid}/referral/on-behalf-of`)
    const div = document.createElement('div')
    div.innerHTML = response.text
    document.body.appendChild(div)
    const topLevelElement = document.documentElement
    expect(getByRole(topLevelElement, 'radio', { name: /no/i })).toBeChecked()
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

  it('should return a 200 on posting good data and redirect to referrer', done => {
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

  it('should return a 200 on posting good data with quoted boolean and redirect to referrer', done => {
    const generatedUuid = uuidv4()
    request(app)
      .post(`/${generatedUuid}/referral/on-behalf-of`)
      .send({ isOnBehalfOfReferral: 'true' })
      .redirects(1)
      .expect('Location', /\/referral\/referrer/)
      .end(() => {
        done()
      })
  })

  it('should return a 200 on posting good data and redirect to area-of-work', done => {
    const generatedUuid = uuidv4()
    request(app)
      .post(`/${generatedUuid}/referral/on-behalf-of`)
      .send({ isOnBehalfOfReferral: false })
      .redirects(1)
      .expect('Location', /\/referral\/area-of-work/)
      .end(() => {
        done()
      })
  })

  it('should return a 200 on posting good data with quoted boolean and redirect to area-of-work', done => {
    const generatedUuid = uuidv4()
    request(app)
      .post(`/${generatedUuid}/referral/on-behalf-of`)
      .send({ isOnBehalfOfReferral: 'false' })
      .redirects(1)
      .expect('Location', /\/referral\/area-of-work/)
      .end(() => {
        done()
      })
  })

  it('should display validation errors correctly', done => {
    const errors = schema.safeParse({ isOnBehalfOfReferral: '', _csrf: '' }).error?.flatten()?.fieldErrors
    const onBehalfOfError = errors?.['isOnBehalfOfReferral']?.[0]
    expect(onBehalfOfError).toBeTruthy()
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
        expect(getByRole(topLevelElement, 'link', { name: onBehalfOfError as string })).toBeVisible()
        const errorTextByRadios = getAllByText(topLevelElement, onBehalfOfError as string).filter(
          el => el.nodeName.toLowerCase() === 'p',
        )[0]
        expect(errorTextByRadios).not.toBeNull()
        done()
      })
  })
})
