import { Express, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import request from 'supertest'
import {
  findByRole,
  getAllByRole,
  getAllByText,
  getByRole,
  getByText,
  queryByAttribute,
  queryByRole,
  waitFor,
} from '@testing-library/dom'
import { userEvent } from '@testing-library/user-event'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import { schemaFactory } from './schemas'
import { TEST_PRISONER } from '../../../routes/testutils/testConstants'
import { JourneyData } from '../../../@types/express'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import type AuditService from '../../../services/auditService'

let app: Express
const uuid = uuidv4()
const auditService = {
  logPageView: () => {},
  logAuditEvent: () => {},
  hmppsAuditClient: undefined,
} as unknown as jest.Mocked<AuditService>
const csipApiService = {
  getReferenceData: () => [
    { code: 'VIC', description: 'Victim' },
    { code: 'PER', description: 'Perpetrator' },
    { code: 'OTH', description: 'Other' },
    { code: 'WIT', description: 'Witness' },
  ],
} as unknown as CsipApiService
const journeyData = {
  prisoner: TEST_PRISONER,
  referral: {
    isProactiveReferral: true,
  },
} as JourneyData
beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      csipApiService,
      auditService,
    },
    uuid,
    journeyData,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('tests', () => {
  it('renders behaviour involvement on get', async () => {
    const res = await request(app).get(`/${uuid}/referral/involvement`).expect(200).expect('Content-Type', /html/)

    const div = document.createElement('div')
    div.innerHTML = res.text
    document.body.appendChild(div)
    const topLevelElement = document.documentElement
    const user = userEvent.setup()
    const radios = getAllByRole(topLevelElement, 'radio')
    radios.forEach(radio => {
      expect(radio).not.toBeChecked()
      expect(radio).toBeVisible()
    })
    expect(getByRole(topLevelElement, 'heading', { name: /behaviour involvement/i })).toBeVisible()
    expect(getByText(topLevelElement, /make a csip referral/i)).toBeVisible()
    expect(getByText(topLevelElement, /How has Test Person been involved in the behaviour?/)).toBeVisible()
    expect(getByText(topLevelElement, /have any staff been assaulted/i)).toBeVisible()
    expect(queryByRole(topLevelElement, 'textbox', { name: 'assaultedStaffName' })).toBeNull()
    expect(getByRole(topLevelElement, 'button', { name: /continue/i })).toBeVisible()
    expect(queryByAttribute('class', topLevelElement, 'govuk-breadcrumbs')).toBeNull()
    expect(getByRole(topLevelElement, 'link', { name: 'Back' })).toBeVisible()

    await user.click(getByRole(topLevelElement, 'radio', { name: /yes/i }))
    expect(await findByRole(topLevelElement, 'textbox', { name: /names of staff assaulted/i })).toBeVisible()
  })

  it('renders incident involvement on get', async () => {
    const res = await request(
      appWithAllRoutes({
        services: {
          csipApiService,
          auditService,
        },
        uuid,
        journeyData: {
          ...journeyData,
          referral: {
            isProactiveReferral: false,
          },
        },
      }),
    )
      .get(`/${uuid}/referral/involvement`)
      .expect(200)
      .expect('Content-Type', /html/)

    const div = document.createElement('div')
    div.innerHTML = res.text
    document.body.appendChild(div)
    const topLevelElement = document.documentElement
    const user = userEvent.setup()
    const radios = getAllByRole(topLevelElement, 'radio')
    radios.forEach(radio => {
      expect(radio).not.toBeChecked()
      expect(radio).toBeVisible()
    })
    expect(getByRole(topLevelElement, 'heading', { name: /incident involvement/i })).toBeVisible()
    expect(getByText(topLevelElement, /make a csip referral/i)).toBeVisible()
    expect(getByText(topLevelElement, /How has Test Person been involved in the incident?/)).toBeVisible()
    expect(getByText(topLevelElement, /were any staff assaulted/i)).toBeVisible()
    expect(queryByRole(topLevelElement, 'textbox', { name: 'assaultedStaffName' })).toBeNull()
    expect(getByRole(topLevelElement, 'button', { name: /continue/i })).toBeVisible()
    expect(queryByAttribute('class', topLevelElement, 'govuk-breadcrumbs')).toBeNull()
    expect(getByRole(topLevelElement, 'link', { name: 'Back' })).toBeVisible()

    await user.click(getByRole(topLevelElement, 'radio', { name: /yes/i }))
    expect(await findByRole(topLevelElement, 'textbox', { name: /names of staff assaulted/i })).toBeVisible()
  })

  it.each([
    [
      {
        type: 'VIC',
        description: 'Victim',
        staffAssaulted: true,
        assaultedStaffName: 'Test Staff',
      },
      {
        type: /victim/i,
        assaulted: /yes/i,
      },
    ],
    [
      {
        type: 'WIT',
        description: 'Witness',
        staffAssaulted: false,
        assaultedStaffName: null,
      },
      {
        type: /witness/i,
        assaulted: /no/i,
      },
    ],
    [
      {
        type: 'OTH',
        description: 'Other',
        staffAssaulted: false,
        assaultedStaffName: null,
      },
      {
        type: /other/i,
        assaulted: /no/i,
      },
    ],
    [
      {
        type: 'PER',
        description: 'Perpetrator',
        staffAssaulted: false,
        assaultedStaffName: null,
      },
      {
        type: /perpetrator/i,
        assaulted: /no/i,
      },
    ],
  ])(
    'should prepopulate %j',
    async (
      testData: { type: string; description: string; staffAssaulted: boolean; assaultedStaffName: string | null },
      expectedValues,
    ) => {
      const response = await request(
        appWithAllRoutes({
          services: {
            csipApiService,
            auditService,
          },
          uuid,
          journeyData: {
            referral: {
              incidentInvolvement: {
                code: testData.type,
                description: testData.description,
                createdAt: new Date().toISOString(),
                createdBy: 'foobar',
              },
              staffAssaulted: testData.staffAssaulted,
              assaultedStaffName: testData.assaultedStaffName,
            },
            prisoner: TEST_PRISONER,
          },
        }),
      ).get(`/${uuid}/referral/involvement`)
      const div = document.createElement('div')
      div.innerHTML = response.text
      document.body.appendChild(div)
      const topLevelElement = document.documentElement
      expect(getByRole(topLevelElement, 'radio', { name: expectedValues.type })).toBeChecked()
      expect(getByRole(topLevelElement, 'radio', { name: expectedValues.assaulted })).toBeChecked()
      if (testData.staffAssaulted) {
        await waitFor(() => {
          expect(queryByRole(topLevelElement, 'textbox', { name: /names of staff assaulted/i })).toBeVisible()
        })
      }
    },
  )

  it('should redirect on posting bad data', async () => {
    await request(app).post(`/${uuid}/referral/involvement`).send({}).redirects(1)
  })

  it('should return a 200 on posting good data with quoted boolean and redirect to referrer', async () => {
    const uuid2 = uuidv4()
    await request(
      appWithAllRoutes({
        services: {
          csipApiService,
          auditService,
        },
        uuid: uuid2,
        journeyData,
      }),
    )
      .post(`/${uuid2}/referral/involvement`)
      .send({ involvementType: 'VIC', staffAssaulted: 'true', assaultedStaffName: 'Test Person' })
      .expect(302)
      .expect('Location', 'description')
  })

  it('should return a 200 on posting good data with quoted boolean and redirect to area-of-work', async () => {
    const uuid2 = uuidv4()
    await request(
      appWithAllRoutes({
        services: {
          csipApiService,
          auditService,
        },
        uuid: uuid2,
        journeyData,
      }),
    )
      .post(`/${uuid2}/referral/involvement`)
      .send({ involvementType: 'VIC', staffAssaulted: 'false', assaultedStaffName: '' })
      .expect(302)
      .expect('Location', 'description')
  })

  it('should display validation errors correctly', async () => {
    const errors = (await schemaFactory(csipApiService)({} as Request))
      .safeParse({ _csrf: '', staffAssaulted: 'false', assaultedStaffName: '' })
      .error?.flatten()?.fieldErrors
    const involvementTypeError = errors?.['involvementType']?.[0]
    expect(involvementTypeError).toBeTruthy()
    const app2 = appWithAllRoutes({
      services: {
        csipApiService,
        auditService,
      },
      uuid,
      validationErrors: errors,
    })
    const res = await request(app2).get(`/${uuid}/referral/involvement`)
    const div = document.createElement('div')
    div.innerHTML = res.text
    document.body.appendChild(div)
    const topLevelElement = document.documentElement
    expect(getByRole(topLevelElement, 'link', { name: involvementTypeError as string })).toBeVisible()
    const errorTextByRadios = getAllByText(topLevelElement, involvementTypeError as string).filter(
      el => el.nodeName.toLowerCase() === 'p',
    )[0]
    expect(errorTextByRadios).not.toBeNull()
  })

  it.each([
    [{ _csrf: '', assaultedStaffName: '' }, ['staffAssaulted', 'involvementType']],
    [{ _csrf: '', assaultedStaffName: '', involvementType: 'FOOBAR' }, ['staffAssaulted', 'involvementType']],
    [{ _csrf: '', assaultedStaffName: '', involvementType: 'VIC' }, ['staffAssaulted']],
    [{ _csrf: '', assaultedStaffName: '', staffAssaulted: 'false' }, ['involvementType']],
    [{ _csrf: '', assaultedStaffName: '', staffAssaulted: 'true', involvementType: 'VIC' }, ['assaultedStaffName']],
    [{ _csrf: '', assaultedStaffName: 'Test Name', staffAssaulted: 'true', involvementType: 'VIC' }, []],
  ] as [Record<string, unknown>, ('involvementType' | 'staffAssaulted' | 'assaultedStaffName' | '_csrf')[]][])(
    'should prepopulate %j',
    async (body, expectedErrors) => {
      const errors = (await schemaFactory(csipApiService)({} as Request)).safeParse(body).error?.flatten()?.fieldErrors
      expectedErrors.forEach(err => {
        expect(errors?.[err]?.[0]).toBeTruthy()
      })
      const app2 = appWithAllRoutes({
        services: {
          csipApiService,
          auditService,
        },
        uuid,
        journeyData,
        validationErrors: errors,
      })
      const res = await request(app2).get(`/${uuid}/referral/involvement`)
      const div = document.createElement('div')
      div.innerHTML = res.text
      document.body.appendChild(div)
      const topLevelElement = document.documentElement
      expectedErrors.forEach(err => {
        const errorText = errors?.[err]?.[0] as string
        expect(getByRole(topLevelElement, 'link', { name: errorText })).toBeVisible()
        const errorTextByRadios = getAllByText(topLevelElement, errorText).filter(
          el => el.nodeName.toLowerCase() === 'p',
        )[0]
        expect(errorTextByRadios).not.toBeNull()
      })
    },
  )
})
