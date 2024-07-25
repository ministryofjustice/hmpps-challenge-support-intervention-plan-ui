import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getAllByText, getByRole, getByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import CsipApiService from '../../../services/csipApi/csipApiService'
import testRequestCaptor, { TestRequestCaptured } from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_PRISONER, TOMORROW_GB_FORMAT } from '../../../routes/testutils/testConstants'
import { ReferenceDataType } from '../../../@types/csip/csipApiTypes'
import { schemaFactory } from './schemas'

const uuid = uuidv4()
const csipApiService = {
  getReferenceData: (_: Request, domain: ReferenceDataType) => {
    switch (domain) {
      case 'incident-location':
        return [{ code: 'A', description: 'TEXT' }]
      case 'incident-type':
        return [{ code: 'B', description: 'TEXT2' }]
      default:
        return []
    }
  },
} as unknown as CsipApiService
const journeyDataProactive = {
  prisoner: TEST_PRISONER,
  referral: {
    isOnBehalfOfReferral: false,
    referredBy: 'Test User',
    refererArea: { code: 'A', description: 'TEXT' },
    isProactiveReferral: true,
  },
} as JourneyData
const journeyDataReactive = {
  ...journeyDataProactive,
  referral: {
    ...journeyDataProactive.referral,
    isProactiveReferral: false,
  },
} as JourneyData

let reqCaptured: TestRequestCaptured
let requestCaptor: (req: Request) => void

const app = (
  {
    journeyData,
    validationErrors,
  }: {
    journeyData?: JourneyData
    validationErrors?: Locals['validationErrors']
  } = { journeyData: journeyDataProactive, validationErrors: undefined },
) => {
  ;[reqCaptured, requestCaptor] = testRequestCaptor(journeyData, uuid)
  return appWithAllRoutes({
    services: { csipApiService },
    uuid,
    requestCaptor,
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/details - Proactive', () => {
  it('render page', async () => {
    const result = await request(app()).get(`/${uuid}/referral/details`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'When was the most recent occurrence of the behaviour?')).toBeVisible()
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect(
      (getByRole(html, 'option', { name: 'Select main concern' }) as HTMLOptionElement).defaultSelected,
    ).toBeTruthy()
    expect(getByRole(html, 'textbox', { name: /date of occurrence/i })).toBeVisible()
    expect(getByText(html, /time of occurrence \(optional\)/i)).toBeVisible()
    expect(
      getByRole(html, 'combobox', { name: /where was the most recent occurrence of this behaviour\?/i }),
    ).toBeVisible()
    expect(getByRole(html, 'combobox', { name: /what's the main concern\?/i })).toBeVisible()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataProactive,
          referral: {
            ...journeyDataProactive.referral,
            incidentLocation: { code: 'A', description: 'TEXT' },
            incidentType: { code: 'B', description: 'TEXT2' },
            incidentDate: '2024-12-25',
            incidentTime: '23:59',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect(
      (getByRole(html, 'option', { name: 'Select main concern' }) as HTMLOptionElement).defaultSelected,
    ).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'textbox', { name: 'Date of occurrence' }) as HTMLInputElement).value).toEqual('25/12/2024')
    expect((getByRole(html, 'textbox', { name: 'Hour' }) as HTMLInputElement).value).toEqual('23')
    expect((getByRole(html, 'textbox', { name: 'Minute' }) as HTMLInputElement).value).toEqual('59')
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({
        journeyData: journeyDataProactive,
        validationErrors: { propertyName: ['Error message'] },
      }),
    )
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('GET /referral/details - Reactive', () => {
  it('render page', async () => {
    const result = await request(app({ journeyData: journeyDataReactive }))
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'When did the incident occur?')).toBeVisible()
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect(
      (getByRole(html, 'option', { name: 'Select incident type' }) as HTMLOptionElement).defaultSelected,
    ).toBeTruthy()
    expect(getByRole(html, 'textbox', { name: /date of incident/i })).toBeVisible()
    expect(getByText(html, /time of incident \(optional\)/i)).toBeVisible()
    expect(getByRole(html, 'combobox', { name: /Where did the incident occur\?/i })).toBeVisible()
    expect(getByRole(html, 'combobox', { name: /What was the incident type\?/i })).toBeVisible()
  })

  it('pre-fill form with values from journeyData', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataReactive,
          referral: {
            ...journeyDataReactive.referral,
            incidentLocation: { code: 'A', description: 'TEXT' },
            incidentType: { code: 'B', description: 'TEXT2' },
            incidentDate: '2024-12-25',
            incidentTime: '23:59',
          },
        } as JourneyData,
      }),
    )
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect((getByRole(html, 'option', { name: 'Select location' }) as HTMLOptionElement).defaultSelected).toBeFalsy()
    expect(
      (getByRole(html, 'option', { name: 'Select incident type' }) as HTMLOptionElement).defaultSelected,
    ).toBeFalsy()
    expect((getByRole(html, 'option', { name: 'TEXT' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'option', { name: 'TEXT2' }) as HTMLOptionElement).defaultSelected).toBeTruthy()
    expect((getByRole(html, 'textbox', { name: 'Date of incident' }) as HTMLInputElement).value).toEqual('25/12/2024')
    expect((getByRole(html, 'textbox', { name: 'Hour' }) as HTMLInputElement).value).toEqual('23')
    expect((getByRole(html, 'textbox', { name: 'Minute' }) as HTMLInputElement).value).toEqual('59')
  })

  it('render validation errors if any', async () => {
    const result = await request(
      app({ journeyData: journeyDataReactive, validationErrors: { propertyName: ['Error message'] } }),
    )
      .get(`/${uuid}/referral/details`)
      .expect(200)
      .expect('Content-Type', /html/)

    const html = createTestHtmlElement(result.text)
    expect(getByText(html, 'There is a problem')).toBeVisible()
    const error = getByRole(html, 'link', { name: 'Error message' }) as HTMLLinkElement
    expect(error).toBeVisible()
    expect(error.href).toMatch(/#propertyName$/)
  })
})

describe('POST /referral/details - Proactive', () => {
  it('redirect to /referral/involvement, save incident location, type, date, and time on valid request', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '23',
        minute: '59',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', 'involvement')

    expect(reqCaptured.journeyData().referral?.incidentLocation).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.incidentType).toEqual({ code: 'B', description: 'TEXT2' })
    expect(reqCaptured.journeyData().referral?.incidentDate).toEqual('2009-12-25')
    expect(reqCaptured.journeyData().referral?.incidentTime).toEqual('23:59')
  })

  it('redirect to /referral/involvement, save incident location, type, and date (with optional time being empty) on valid request', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', 'involvement')

    expect(reqCaptured.journeyData().referral?.incidentLocation).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.incidentType).toEqual({ code: 'B', description: 'TEXT2' })
    expect(reqCaptured.journeyData().referral?.incidentDate).toEqual('2009-12-25')
    expect(reqCaptured.journeyData().referral?.incidentTime).toBeNull()
  })

  it('redirect to go back and set all validation errors and in correct order if all inputs are invalid', async () => {
    const errors = (
      await schemaFactory(csipApiService)({
        journeyData: journeyDataProactive,
      } as Request)
    )
      .safeParse({
        incidentLocation: '',
        incidentType: '',
        hour: '',
        minute: '',
        incidentDate: '',
      })
      .error?.flatten()?.fieldErrors
    const res = await request(
      app({
        validationErrors: errors,
        journeyData: journeyDataProactive,
      }),
    ).get(`/${uuid}/referral/details`)
    const div = document.createElement('div')
    div.innerHTML = res.text
    document.body.appendChild(div)
    const topLevelElement = document.documentElement
    const errorMessages = [
      'Enter the date of the most recent occurrence',
      'Select the location of the most recent occurrence',
      'Select the main concern',
    ]
    errorMessages.forEach(errMsg => {
      expect(getByRole(topLevelElement, 'link', { name: errMsg })).toBeVisible()
      const errorTextByInputs = getAllByText(topLevelElement, errMsg).filter(el => el.nodeName.toLowerCase() === 'p')[0]
      expect(errorTextByInputs).not.toBeNull()
    })

    // This may end up being brittle, if breaking often, revisit, but this is to test error messages appear in correct order
    expect(topLevelElement.querySelector('ul.govuk-error-summary__list li:nth-of-type(1) a')?.textContent).toEqual(
      errorMessages[0],
    )
    expect(topLevelElement.querySelector('ul.govuk-error-summary__list li:nth-of-type(2) a')?.textContent).toEqual(
      errorMessages[1],
    )
    expect(topLevelElement.querySelector('ul.govuk-error-summary__list li:nth-of-type(3) a')?.textContent).toEqual(
      errorMessages[2],
    )
  })

  it('redirect to go back and set validation errors if time input is invalid', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '12',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentTime: ['Enter a time using the 24-hour clock'] })
  })

  it('redirect to go back and set validation errors if time contains non numeric characters', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '0d',
        minute: 'ef',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentTime: ['Enter a time using the 24-hour clock'] })
  })

  it('redirect to go back and set validation errors if incident date is in the future', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: TOMORROW_GB_FORMAT,
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      incidentDate: ['Date of the most recent occurrence must be today or in the past'],
    })
  })

  it('redirect to go back and set validation errors if incident date is invalid', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '2009-Dec-25',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentDate: ['Enter the date of the most recent occurrence'] })
  })

  it('redirect to go back and set validation errors if incident location is missing', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: '',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      incidentLocation: ['Select the location of the most recent occurrence'],
    })
  })

  it('redirect to go back and set validation errors if incident type is missing', async () => {
    await request(app())
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: '',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentType: ['Select the main concern'] })
  })
})

describe('POST /referral/details - Reactive', () => {
  it('redirect to /referral/involvement, save incident location, type, date, and time on valid request', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '23',
        minute: '59',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', 'involvement')

    expect(reqCaptured.journeyData().referral?.incidentLocation).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.incidentType).toEqual({ code: 'B', description: 'TEXT2' })
    expect(reqCaptured.journeyData().referral?.incidentDate).toEqual('2009-12-25')
    expect(reqCaptured.journeyData().referral?.incidentTime).toEqual('23:59')
  })

  it('redirect to /referral/involvement, save incident location, type, and date (with optional time being empty) on valid request', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', 'involvement')

    expect(reqCaptured.journeyData().referral?.incidentLocation).toEqual({ code: 'A', description: 'TEXT' })
    expect(reqCaptured.journeyData().referral?.incidentType).toEqual({ code: 'B', description: 'TEXT2' })
    expect(reqCaptured.journeyData().referral?.incidentDate).toEqual('2009-12-25')
    expect(reqCaptured.journeyData().referral?.incidentTime).toBeNull()
  })

  it('redirect to go back and set validation errors if time input is invalid', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '12',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentTime: ['Enter a time using the 24-hour clock'] })
  })

  it('redirect to go back and set validation errors if incident date is in the future', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: TOMORROW_GB_FORMAT,
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      incidentDate: ['Date of the incident must be today or in the past'],
    })
  })

  it('redirect to go back and set validation errors if incident date is invalid', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '2009-Dec-25',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentDate: ['Enter the date of the incident'] })
  })

  it('redirect to go back and set validation errors if incident location is missing', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: '',
        incidentType: 'B',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({
      incidentLocation: ['Select the location of the incident'],
    })
  })

  it('redirect to go back and set validation errors if incident type is missing', async () => {
    await request(app({ journeyData: journeyDataReactive }))
      .post(`/${uuid}/referral/details`)
      .type('form')
      .send({
        incidentLocation: 'A',
        incidentType: '',
        hour: '',
        minute: '',
        incidentDate: '25/12/2009',
      })
      .expect(302)
      .expect('Location', '/')

    expect(reqCaptured.validationErrors()).toEqual({ incidentType: ['Select the incident type'] })
  })
})
