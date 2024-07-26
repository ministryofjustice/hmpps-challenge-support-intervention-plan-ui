import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, queryAllByText, queryByRole, queryByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_DPS_HOMEPAGE, TEST_PRISONER } from '../../../routes/testutils/testConstants'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import { components } from '../../../@types/csip'
import { schema as saferCustodySchema } from '../safer-custody/schemas'

const TEST_PATH = 'referral/check-answers'
const uuid = uuidv4()

const journeyDataMock = {
  prisoner: TEST_PRISONER,
  referral: {
    isOnBehalfOfReferral: true,
    referredBy: '<script>alert("Test User")</script>',
    refererArea: { code: 'A', description: '<script>alert("Area")</script>' },
    isProactiveReferral: true,
    incidentLocation: { code: 'A', description: '<script>alert("Location")</script>' },
    incidentType: { code: 'A', description: '<script>alert("IncidentType")</script>' },
    incidentDate: '2024-12-25',
    incidentTime: '23:59',
    incidentInvolvement: { code: 'A', description: '<script>alert("Involvement")</script>' },
    staffAssaulted: true,
    assaultedStaffName: '<script>alert("Staff Name")</script>',
    descriptionOfConcern: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('xss');</script>
    
    <button>this button should be escaped</button>`,
    knownReasons: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('xss');</script>
    
    <button>also should be escaped</button>`,
    contributoryFactors: [
      {
        factorType: { code: 'A', description: 'Text' },
      },
      {
        factorType: { code: 'B', description: '<script>alert("Text for type-B")</script>' },
        comment: `Text

        • Bullet 1
        • Bullet 2
        • Bullet 3
        
        Paragraph
        
        <script>alert('xss');</script>
        
        <button>factor comment button should be escaped</button>`,
      },
      {
        factorType: { code: 'C', description: 'Text with a TLA' },
      },
    ],
    isSaferCustodyTeamInformed: saferCustodySchema.shape.isSaferCustodyTeamInformed.enum.YES,
    otherInformation: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('xss');</script>
    
    <button>otherinfo button should be escaped</button>`,
  },
} as JourneyData

let requestCaptor: (req: Request) => void
let createReferralPayload: components['schemas']['CreateCsipRecordRequest']

const app = (
  {
    journeyData,
    validationErrors,
  }: {
    journeyData?: JourneyData
    validationErrors?: Locals['validationErrors']
  } = { journeyData: journeyDataMock, validationErrors: undefined },
) => {
  // eslint-disable-next-line prefer-destructuring
  requestCaptor = testRequestCaptor(journeyData, uuid)[1]
  return appWithAllRoutes({
    services: {
      csipApiService: {
        createReferral: async (_: unknown, createRequest: components['schemas']['CreateCsipRecordRequest']) => {
          createReferralPayload = createRequest
          return {
            createdAt: '',
            createdBy: '',
            createdByDisplayName: '',
            prisonNumber: '',
            recordUuid: '',
            referral: {
              isSaferCustodyTeamInformed: saferCustodySchema.shape.isSaferCustodyTeamInformed.enum.NO,
              contributoryFactors: [],
              incidentDate: '',
              incidentLocation: {
                code: '',
                createdAt: '',
                createdBy: '',
              },
              incidentType: {
                code: '',
                createdAt: '',
                createdBy: '',
              },
              refererArea: { code: '', createdAt: '', createdBy: '' },
              referredBy: '',
            },
          } as components['schemas']['CsipRecord']
        },
      } as unknown as CsipApiService,
    },
    uuid,
    requestCaptor,
    validationErrors,
  })
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referral/check-answers', () => {
  it('render page for proactive referral', async () => {
    const result = await request(app()).get(`/${uuid}/${TEST_PATH}`).expect(200).expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: 'Behaviour details' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Behaviour involvement' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Behaviour description' })).toBeVisible()

    expect(queryByText(html, journeyDataMock.referral!.referredBy!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.refererArea!.description!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.incidentLocation!.description!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.incidentType!.description!)).toBeVisible()
    expect(queryByText(html, '25 December 2024')).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.incidentInvolvement!.description!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.assaultedStaffName!)).toBeVisible()
    // We should have script tags as plain text
    expect(queryAllByText(html, /<script>alert\('xss'\);<\/script>/i)).toHaveLength(4)
    // But not as actual script tags
    expect(
      [...html.querySelectorAll('script')].filter(el => (el as HTMLScriptElement)?.textContent?.includes('xss')),
    ).toHaveLength(0)
    expect(queryByRole(html, 'button', { name: /this button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /also should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /factor comment button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /otherinfo button should be escaped/i })).not.toBeInTheDocument()
    const lines = (String(journeyDataMock.referral!.descriptionOfConcern!).match(/\n/g) || '').length
    queryAllByText(html, /<script>alert\('xss'\);<\/script>/i).forEach(el => {
      expect(el.querySelectorAll('br')).toHaveLength(lines)
    })
    expect(queryByText(html, 'Comment on <script>alert("text for type-b")</script>')).toBeVisible()

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is being made on behalf of someone else or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/on-behalf-of#isOnBehalfOfReferral$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change name of referrer',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/referrer#referredBy$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change area of work',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/referrer#areaOfWork$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is proactive or reactive',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/proactive-or-reactive#isProactiveReferral$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change date of occurrence',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentDate$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change time of occurrence',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentTime-hour$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change location of occurrence',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentLocation$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change main concern',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentType$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change how the prisoner was involved',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/involvement#involvementType$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if a staff member was assaulted or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/involvement#staffAssaulted$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the name of the staff members assaulted',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/involvement#assaultedStaffName$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the description of the behaviour and concerns',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/description#descriptionOfConcern$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the reasons given for the behaviour',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/reasons#knownReasons$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the contributory factors',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/contributory-factors#contributoryFactors$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the comment on text with a TLA factors',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/c-comment#comment$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if Safer Custody are aware of the referral or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/safer-custody#isSaferCustodyTeamInformed$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the additional information relating to the referral',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/additional-information#otherInformation$/)

    expect((getByRole(html, 'link', { name: 'Cancel' }) as HTMLLinkElement).href).toEqual(TEST_DPS_HOMEPAGE)
  })

  it('render page for reactive referral', async () => {
    const result = await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            isOnBehalfOfReferral: false,
            isProactiveReferral: false,
          },
        },
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'heading', { name: 'Incident details' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Incident involvement' })).toBeVisible()
    expect(getByRole(html, 'heading', { name: 'Incident description' })).toBeVisible()

    expect(queryByText(html, journeyDataMock.referral!.referredBy!)).not.toBeInTheDocument()
    expect(queryByText(html, journeyDataMock.referral!.refererArea!.description!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.incidentLocation!.description!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.incidentType!.description!)).toBeVisible()
    expect(queryByText(html, '25 December 2024')).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.incidentInvolvement!.description!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.assaultedStaffName!)).toBeVisible()
    expect(queryByText(html, 'Comment on <script>alert("text for type-b")</script>')).toBeVisible()
    const lines = (String(journeyDataMock.referral!.descriptionOfConcern!).match(/\n/g) || '').length
    queryAllByText(html, /<script>alert\('xss'\);<\/script>/i).forEach(el => {
      expect(el.querySelectorAll('br')).toHaveLength(lines)
    })
    // We should have script tags as plain text
    expect(queryAllByText(html, /<script>alert\('xss'\);<\/script>/i)).toHaveLength(4)
    // But not as actual script tags
    expect(
      [...html.querySelectorAll('script')].filter(el => (el as HTMLScriptElement)?.textContent?.includes('xss')),
    ).toHaveLength(0)
    expect(queryByRole(html, 'button', { name: /this button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /also should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /factor comment button should be escaped/i })).not.toBeInTheDocument()
    expect(queryByRole(html, 'button', { name: /otherinfo button should be escaped/i })).not.toBeInTheDocument()

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is being made on behalf of someone else or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/on-behalf-of#isOnBehalfOfReferral$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change area of work',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/area-of-work#areaOfWork$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is proactive or reactive',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/proactive-or-reactive#isProactiveReferral$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change date of incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentDate$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change time of incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentTime-hour$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change location of incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentLocation$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change incident type',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details#incidentType$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the description of the incident and concerns',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/description#descriptionOfConcern$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the reasons given for the incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/reasons#knownReasons$/)
  })

  it('render page with validation errors', async () => {
    const result = await request(
      app({
        validationErrors: {
          referral: [`Validation failure: Couldn't read request body`],
        },
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            isOnBehalfOfReferral: false,
            isProactiveReferral: false,
          },
        },
      }),
    )
      .get(`/${uuid}/${TEST_PATH}`)
      .expect(200)
      .expect('Content-Type', /html/)
    const html = createTestHtmlElement(result.text)
    expect(getByRole(html, 'link', { name: `Validation failure: Couldn't read request body` })).toBeVisible()
  })
})

describe('POST /referral/check-answers', () => {
  it('redirect to /referral/confirmation and handle incidentTime being optional', async () => {
    await request(
      app({
        journeyData: {
          ...journeyDataMock,
          referral: {
            ...journeyDataMock.referral,
            incidentTime: undefined,
          } as unknown as JourneyData['referral'],
        } as JourneyData,
      }),
    )
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({})
      .expect(302)
      .expect('Location', 'confirmation')

    expect(createReferralPayload.referral.incidentTime).toBeFalsy()
  })

  it('redirect to /referral/confirmation', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({})
      .expect(302)
      .expect('Location', 'confirmation')
  })

  it('redirect to /referral/check-answers on bad api call', async () => {
    await request(
      appWithAllRoutes({
        services: {
          csipApiService: {
            createReferral: () => {
              // eslint-disable-next-line no-throw-literal
              throw {
                data: {
                  userMessage: 'Bad request!',
                },
              }
            },
          } as unknown as CsipApiService,
        },
        uuid,
        requestCaptor: testRequestCaptor(journeyDataMock, uuid)[1],
      }),
    )
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({})
      .expect(302)
      // We're redirecting 'back' which because we've only gone to one route means we go 'back' to root
      .expect('Location', '/')
  })
})
