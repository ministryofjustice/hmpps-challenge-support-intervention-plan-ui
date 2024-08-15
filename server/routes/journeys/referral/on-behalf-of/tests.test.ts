import { Express } from 'express'
import { v4 as uuidV4 } from 'uuid'
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
import { appWithAllRoutes } from '../../../testutils/appSetup'
import { schema } from './schemas'
import { TEST_PRISONER } from '../../../../testutils/testConstants'
import { JourneyData } from '../../../../@types/express'
import testRequestCaptor from '../../../../testutils/testRequestCaptor'

let app: Express
const uuid = uuidV4()
const journeyData = {
  prisoner: TEST_PRISONER,
  referral: {},
} as JourneyData
const requestCaptor = testRequestCaptor(journeyData, uuid)[1]
beforeEach(() => {
  app = appWithAllRoutes({
    uuid,
    requestCaptor,
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
        expect(getByText(topLevelElement, /You can use this service to refer Test Person/)).toBeVisible()
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
          prisoner: TEST_PRISONER,
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
          prisoner: TEST_PRISONER,
        },
      }),
    ).get(`/${uuid}/referral/on-behalf-of`)
    const div = document.createElement('div')
    div.innerHTML = response.text
    document.body.appendChild(div)
    const topLevelElement = document.documentElement
    expect(getByRole(topLevelElement, 'radio', { name: /no/i })).toBeChecked()
  })

  it('should redirect on posting bad data', async () => {
    await request(app).post(`/${uuid}/referral/on-behalf-of`).send({}).redirects(1)
  })

  it('should return a 200 on posting good data with quoted boolean and redirect to referrer', async () => {
    await request(app)
      .post(`/${uuid}/referral/on-behalf-of`)
      .send({ isOnBehalfOfReferral: 'true' })
      .expect(302)
      .expect('Location', 'referrer')
  })

  it('should return a 200 on posting good data with quoted boolean and redirect to area-of-work', async () => {
    await request(app)
      .post(`/${uuid}/referral/on-behalf-of`)
      .send({ isOnBehalfOfReferral: 'false' })
      .expect(302)
      .expect('Location', 'area-of-work')
  })

  it('should display validation errors correctly', done => {
    const errors = schema.safeParse({ isOnBehalfOfReferral: '', _csrf: '' }).error?.flatten()?.fieldErrors
    const onBehalfOfError = errors?.['isOnBehalfOfReferral']?.[0]
    expect(onBehalfOfError).toBeTruthy()
    const app2 = appWithAllRoutes({
      services: {},
      uuid,
      validationErrors: errors,
      requestCaptor,
    })
    request(app2)
      .get(`/${uuid}/referral/on-behalf-of`)
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
