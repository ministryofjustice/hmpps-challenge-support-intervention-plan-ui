import { Locals, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { agent as request } from 'supertest'
import { getByRole, queryByText } from '@testing-library/dom'
import { appWithAllRoutes } from '../../../routes/testutils/appSetup'
import testRequestCaptor from '../../../routes/testutils/testRequestCaptor'
import createTestHtmlElement from '../../../routes/testutils/createTestHtmlElement'
import { JourneyData } from '../../../@types/express'
import { TEST_DPS_HOMEPAGE, TEST_PRISONER } from '../../../routes/testutils/testConstants'

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
    descriptionOfConcern: '<script>alert("Sample Concern Text")</script>',
    knownReasons: '<script>alert("Sample reason text")</script>',
    contributoryFactors: [
      {
        factorType: { code: 'A', description: 'Text' },
      },
      {
        factorType: { code: 'B', description: '<script>alert("Text for type-B")</script>' },
        comment: '<script>alert("Sample Comment Text")</script>',
      },
      {
        factorType: { code: 'C', description: 'Text with a TLA' },
      },
    ],
    isSaferCustodyTeamInformed: 'yes',
    otherInformation: '<script>alert("Sample information text")</script>',
  },
} as JourneyData

let requestCaptor: (req: Request) => void

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
    services: {},
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
    expect(queryByText(html, journeyDataMock.referral!.descriptionOfConcern!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.knownReasons!)).toBeVisible()
    expect(queryByText(html, 'Comment on <script>alert("text for type-b")</script>')).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.contributoryFactors![1]!.comment!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.otherInformation!)).toBeVisible()

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is being made on behalf of someone else or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/on-behalf-of$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change name of referrer',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/referrer$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change area of work',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/referrer$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is proactive or reactive',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/proactive-or-reactive$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change date of occurrence',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change time of occurrence',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change location of occurrence',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change main concern',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change how the prisoner was involved',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/involvement$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if a staff member was assaulted or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/involvement$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the name of the staff members assaulted',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/involvement$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the description of the behaviour and concerns',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/description$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the reasons given for the behaviour',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/reasons$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the contributory factors',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/contributory-factors$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the comment on text with a TLA factors',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/c-comment$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if Safer Custody are aware of the referral or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/safer-custody$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the additional information relating to the referral',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/additional-information$/)

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
    expect(queryByText(html, journeyDataMock.referral!.descriptionOfConcern!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.knownReasons!)).toBeVisible()
    expect(queryByText(html, 'Comment on <script>alert("text for type-b")</script>')).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.contributoryFactors![1]!.comment!)).toBeVisible()
    expect(queryByText(html, journeyDataMock.referral!.otherInformation!)).toBeVisible()

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is being made on behalf of someone else or not',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/on-behalf-of$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change area of work',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/area-of-work$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change if the referral is proactive or reactive',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/proactive-or-reactive$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change date of incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change time of incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change location of incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change incident type',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/details$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the description of the incident and concerns',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/description$/)

    expect(
      (
        getByRole(html, 'link', {
          name: 'Change the reasons given for the incident',
        }) as HTMLLinkElement
      ).href,
    ).toMatch(/reasons$/)
  })
})

describe('POST /referral/check-answers', () => {
  it('redirect to /referral/confirmation', async () => {
    await request(app())
      .post(`/${uuid}/${TEST_PATH}`)
      .type('form')
      .send({})
      .expect(302)
      .expect('Location', 'confirmation')
  })
})