import { stubFor } from './wiremock'
import { YES_NO_ANSWER } from '../../server/routes/journeys/referral/safer-custody/schemas'
import { CsipRecord, CsipSearchResults, ReferenceData } from '../../server/@types/csip/csipApiTypes'
import { components } from '../../server/@types/csip'
import { mergeObjects } from '../../server/testutils/utils'

const uuidRegex = '([a-zA-Z0-9]+-){4}[a-zA-Z0-9]+'

const createBasicHttpStub = (method: string, urlPattern: string, status: number, jsonBody: object = {}) => {
  return createHttpStub(method, urlPattern, undefined, undefined, status, jsonBody)
}

const createHttpStub = (
  method: string,
  urlPathPattern: string,
  queryParameters: object | undefined,
  bodyPatterns: Array<object> | undefined,
  status: number,
  jsonBody?: object,
) => {
  return stubFor({
    request: { method, urlPathPattern, queryParameters, bodyPatterns },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody,
    },
  })
}

const stubAreaOfWork = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/area-of-work', 200, [
    {
      code: 'A',
      description: 'AreaA',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'B',
      description: 'AreaB',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const stubIncidentLocation = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/incident-location', 200, [
    {
      code: 'A',
      description: 'LocationA',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'B',
      description: 'LocationB',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const createRefDataItem = (params: Partial<ReferenceData>) => {
  const sentenceCase = (text?: string) => {
    const lowerText = (text || '').replaceAll('_', ' ').toLowerCase()
    return lowerText.charAt(0).toUpperCase() + lowerText.slice(1)
  }

  return {
    code: params.code ?? 'CODE',
    description: params.description ?? sentenceCase(params.code),
    listSequence: params.listSequence ?? 1,
    deactivatedAt: params.deactivatedAt ?? null,
  } as ReferenceData
}

const stubStatus = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/status', 200, [
    createRefDataItem({ code: 'CSIP_CLOSED', description: 'CSIP closed' }),
    createRefDataItem({ code: 'CSIP_OPEN', description: 'CSIP open' }),
    createRefDataItem({ code: 'AWAITING_DECISION' }),
    createRefDataItem({ code: 'PLAN_PENDING' }),
    createRefDataItem({ code: 'INVESTIGATION_PENDING' }),
    createRefDataItem({ code: 'REFERRAL_SUBMITTED' }),
    createRefDataItem({ code: 'REFERRAL_PENDING' }),
    createRefDataItem({ code: 'NO_FURTHER_ACTION' }),
    createRefDataItem({ code: 'SUPPORT_OUTSIDE_CSIP', description: 'Support outside of CSIP' }),
  ])
}

const stubIncidentType = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/incident-type', 200, [
    {
      code: 'A',
      description: 'TypeA',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'B',
      description: 'TypeB',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const stubIntervieweeRoles = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/interviewee-role', 200, [
    {
      code: 'A',
      description: 'Role1',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'B',
      description: 'Role2',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const stubDecisionSignerRoles = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/role', 200, [
    {
      code: 'A',
      description: 'SignerRole1',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'B',
      description: 'SignerRole2',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const stubOneContribFactor = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/contributory-factor-type', 200, [
    {
      code: 'A',
      description: 'text',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const stubContribFactors = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/contributory-factor-type', 200, [
    {
      code: 'CODE1',
      description: 'Factor1',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'CODE2',
      description: 'Factor2',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'CODE3',
      description: 'Factor3',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'CODE4',
      description: 'Factor4',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: `A<>"'&`,
      description: 'Factor5',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const stubIncidentInvolvement = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/incident-involvement', 200, [
    {
      code: 'CODE1',
      description: 'Factor1',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'CODE2',
      description: 'Factor2',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'CODE3',
      description: 'Factor3',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
    {
      code: 'CODE4',
      description: 'Factor4',
      createdAt: new Date().toISOString(),
      createdBy: 'foobar',
    },
  ])
}

const stubCsipRecordPostFailure = () => {
  return createBasicHttpStub('POST', '/csip-api/prisoners/[a-zA-Z0-9]*/csip-records', 400, {
    userMessage: "Validation failure: Couldn't read request body",
  })
}

const stubCsipRecordPostSuccess = () => {
  return createBasicHttpStub('POST', '/csip-api/prisoners/[a-zA-Z0-9]*/csip-records', 200, {
    recordUuid: 'a1a1aaa1-aa11-1aaa-111a-1aa1111aaaa1',
    prisonNumber: 'A1111AA',
    prisonCodeWhenRecorded: 'AAA',
    logCode: null,
    createdAt: '2024-07-22T13:03:12',
    createdBy: 'A_USER',
    createdByDisplayName: 'Test User',
    lastModifiedAt: null,
    lastModifiedBy: null,
    lastModifiedByDisplayName: null,
    referral: {
      incidentDate: '2024-07-01',
      incidentTime: '12:24:00',
      incidentType: {
        code: 'AAA',
        description: 'Incident desc',
        listSequence: 99,
        createdAt: '2018-10-27T18:11:30',
        createdBy: 'SYS_USER',
        lastModifiedAt: null,
        lastModifiedBy: null,
        deactivatedAt: null,
        deactivatedBy: null,
      },
      incidentLocation: {
        code: 'BBB',
        description: 'Incident desc B',
        listSequence: 99,
        createdAt: '2018-10-27T18:11:30',
        createdBy: 'SYS_USER',
        lastModifiedAt: null,
        lastModifiedBy: null,
        deactivatedAt: null,
        deactivatedBy: null,
      },
      referredBy: 'test person',
      refererArea: {
        code: 'AAA',
        description: 'Referer desc',
        listSequence: 99,
        createdAt: '2018-10-27T18:11:30',
        createdBy: 'SYS_USER',
        lastModifiedAt: null,
        lastModifiedBy: null,
        deactivatedAt: null,
        deactivatedBy: null,
      },
      referralSummary: null,
      isProactiveReferral: false,
      isStaffAssaulted: true,
      assaultedStaffName: 'test assaultee',
      releaseDate: null,
      incidentInvolvement: {
        code: 'AA',
        description: 'Involvement desc',
        listSequence: 99,
        createdAt: '2018-10-30T16:00:46',
        createdBy: 'FOO_BAR',
        lastModifiedAt: null,
        lastModifiedBy: null,
        deactivatedAt: null,
        deactivatedBy: null,
      },
      descriptionOfConcern: 'a description of the incident',
      knownReasons: 'some reasons for the incident',
      otherInformation: 'additional info',
      isSaferCustodyTeamInformed: 'YES',
      isReferralComplete: null,
      contributoryFactors: [
        {
          factorUuid: '459cc64f-61c3-45d7-88f2-174d5bc77f26',
          factorType: {
            code: 'AAA',
            description: 'AAA desc',
            listSequence: 99,
            createdAt: '2018-10-27T18:11:30',
            createdBy: 'OMS_OWNER',
            lastModifiedAt: null,
            lastModifiedBy: null,
            deactivatedAt: null,
            deactivatedBy: null,
          },
          comment: 'comment A',
          createdAt: '2024-07-22T13:03:12',
          createdBy: 'TEST_USER',
          createdByDisplayName: 'FOO',
          lastModifiedAt: null,
          lastModifiedBy: null,
          lastModifiedByDisplayName: null,
        },
        {
          factorUuid: '4ee74212-f257-46f9-8139-d70e8756b678',
          factorType: {
            code: 'BBB',
            description: 'BBB DESC',
            listSequence: 99,
            createdAt: '2018-10-27T18:11:30',
            createdBy: 'SYS_USER',
            lastModifiedAt: null,
            lastModifiedBy: null,
            deactivatedAt: null,
            deactivatedBy: null,
          },
          comment: 'comment b',
          createdAt: '2024-07-22T13:03:12',
          createdBy: 'TEST_USER',
          createdByDisplayName: 'FOO',
          lastModifiedAt: null,
          lastModifiedBy: null,
          lastModifiedByDisplayName: null,
        },
      ],
      investigation: null,
      saferCustodyScreeningOutcome: null,
      decisionAndActions: null,
    },
    plan: [],
  })
}

const stubCsipRecordPatchSuccess = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/${uuidRegex}`, 200, {})
}

const stubCsipRecordPutSuccess = () => {
  return createBasicHttpStub('PUT', `/csip-api/csip-records/${uuidRegex}/referral`, 200, {})
}

const stubCsipRecordPatchFail = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/${uuidRegex}`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubContributoryFactorPostSuccess = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/referral/contributory-factors`, 201, {})
}

const stubDecisionOutcomeType = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/decision-outcome-type', 200, [
    { code: 'ACC', description: 'Another option' },
    { code: 'NFA', description: 'No further action' },
  ])
}

const stubScreeningOutcomeType = () => {
  return createBasicHttpStub('GET', '/csip-api/reference-data/screening-outcome-type', 200, [
    { code: 'ACC', description: 'Another option' },
    { code: 'NFA', description: 'No further action' },
  ])
}

const stubCsipRecordSuccessAwaitingDecision = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...basicCsip,
    status: {
      code: 'AWAITING_DECISION',
      description: 'Awaiting decision',
    },
    referral: {
      ...basicCsip.referral,
      saferCustodyScreeningOutcome: {
        outcome: { code: 'NFA', description: 'No further action' },
        recordedBy: 'Test User',
        recordedByDisplayName: 'Test',
        date: '2024-08-01',
        reasonForDecision: 'a very well thought out reason',
        history: [],
      },
      investigation: {
        interviews: [
          {
            interviewee: 'Another Person',
            interviewDate: '2024-12-29',
            intervieweeRole: { code: 'A', description: 'Role1' },
            interviewText: 'some text',
            interviewUuid: 'abc1-abc1-abc1-abc1-abc1',
          },
          {
            interviewee: 'Some Person',
            interviewDate: '2024-12-25',
            intervieweeRole: { code: 'B', description: 'Role2' },
            interviewText: 'other stuff',
            interviewUuid: 'abc1-abc1-abc1-abc1-abc2',
          },
        ],
        staffInvolved: 'staff stafferson',
        evidenceSecured: 'SomeVidence',
        occurrenceReason: 'bananas',
        personsUsualBehaviour: 'a great person',
        personsTrigger: 'spiders',
        protectiveFactors: 'SomeFactors',
      },
    },
  } as CsipRecord)
}

const stubCsipRecordSuccessAwaitingDecisionNoInterviews = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...basicCsip,
    status: {
      code: 'AWAITING_DECISION',
      description: 'Awaiting decision',
    },
    referral: {
      ...basicCsip.referral,
      investigation: {
        interviews: [],
        staffInvolved: 'staff stafferson',
        evidenceSecured: 'SomeVidence',
        occurrenceReason: 'bananas',
        personsUsualBehaviour: 'a great person',
        personsTrigger: 'spiders',
        protectiveFactors: 'SomeFactors',
      },
    },
  })
}

const stubCsipRecordSuccessPlanPendingCUR = () => {
  const planPendingCURBody = {
    ...planPendingBody,
    referral: {
      ...planPendingBody.referral,
      saferCustodyScreeningOutcome: {
        ...planPendingBody.referral.saferCustodyScreeningOutcome,
        outcome: { code: 'CUR', description: 'Progress to CSIP' },
      },
    },
  }
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    planPendingCURBody,
  )
}

const stubCsipRecordSuccessPlanPending = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, planPendingBody)
}

const stubCsipRecordSuccessPlanPendingWithDecisionHistory = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...planPendingBody,
    referral: {
      ...planPendingBody.referral,
      decisionAndActions: {
        ...planPendingBody.referral.decisionAndActions,
        history: [
          {
            conclusion: 'another decision',
            outcome: { code: 'NFA', description: 'No further action' },
            signedOffByRole: {
              code: 'A',
              description: 'prison officer',
            },
            recordedBy: 'same person',
            recordedByDisplayName: 'same person longer',
            date: '2024-08-01',
            nextSteps: `nextSteps`,
            actions: ['OPEN_CSIP_ALERT'],
            actionOther: `actionsOther`,
          },
          {
            conclusion: 'another historical decision',
            outcome: { code: 'CUR', description: 'Progress to CSIP' },
            signedOffByRole: {
              code: 'CUS',
              description: 'Custodial Manager',
            },
            recordedBy: 'a different person',
            recordedByDisplayName: 'a different person longer',
            date: '2024-08-02',
            nextSteps: `nextSteps again`,
            actions: ['OPEN_CSIP_ALERT'],
            actionOther: `actionsOther again`,
          },
        ],
      },
    },
  })
}

const stubCsipRecordSuccessPlanPendingNomis = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...planPendingBody,
    referral: {
      ...planPendingBody.referral,
      decisionAndActions: {
        ...planPendingBody.referral.decisionAndActions,
        signedOffByRole: undefined,
      },
    },
  })
}

const stubCsipRecordSuccessCsipOpenWith = (replacer: components['schemas']['CsipRecord']) => {
  const augmentedCsip = structuredClone(csipOpen)
  mergeObjects(augmentedCsip, replacer)
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, augmentedCsip)
}

const stubCsipRecordGetSuccess = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, basicCsip)
}

const stubCsipRecordGetSuccessReferralPending = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...basicCsip,
    referral: {
      ...basicCsip.referral,
      isReferralComplete: false,
      incidentDate: '2024-01-01',
      isOnBehalfOfReferral: undefined,
    },
    status: {
      code: 'REFERRAL_PENDING',
      description: 'Referral pending',
    },
  })
}

const stubCsipRecordGetSuccessReferralPendingMatchingReferrer = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...basicCsip,
    referral: {
      ...basicCsip.referral,
      isReferralComplete: false,
      incidentDate: '2024-01-01',
      isOnBehalfOfReferral: undefined,
      referredBy: 'John Smith',
    },
    status: {
      code: 'REFERRAL_PENDING',
      description: 'Referral pending',
    },
  })
}

const stubGetServiceInfoOneAgencyLEI = () => {
  return createBasicHttpStub('GET', '/csip-api/info', 200, {
    activeAgencies: ['LEI'],
  })
}

const stubGetServiceInfoAllAgencies = () => {
  return createBasicHttpStub('GET', '/csip-api/info', 200, {
    activeAgencies: ['***'],
  })
}

const stubGetServiceInfoOneAgencyMDI = () => {
  return createBasicHttpStub('GET', '/csip-api/info', 200, {
    activeAgencies: ['MDI'],
  })
}

const stubGetServiceInfoNoAgencies = () => {
  return createBasicHttpStub('GET', '/csip-api/info', 200, {
    activeAgencies: [],
  })
}

const stubCsipRecordGetSuccessAfterScreeningWithReason = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome('a very well thought out reason'),
  )
}

const stubCsipRecordGetSuccessAfterScreeningWithoutReason = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome(''),
  )
}

const stubCsipRecordGetSuccessAfterScreeningWithHistory = () => {
  const csip = csipRecordWithScreeningOutcome('')
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...csip,
    referral: {
      ...csip.referral,
      saferCustodyScreeningOutcome: {
        ...csip.referral.saferCustodyScreeningOutcome,
        history: [
          {
            ...csip.referral.saferCustodyScreeningOutcome,
            date: '2024-08-01',
            reasonForDecision: 'a very well thought out reason',
            outcome: { code: 'NFA', description: 'No further action' },
          },
          {
            ...csip.referral.saferCustodyScreeningOutcome,
            date: '2024-08-02',
            reasonForDecision: 'a very well thought out reason',
            outcome: { code: 'CUR', description: 'Progress to CSIP' },
          },
        ],
      },
    },
  })
}

const stubCsipRecordGetSuccessAfterScreeningNFA = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome('', {
      code: 'NO_FURTHER_ACTION',
      description: 'No further action',
    }),
  )
}

const stubCsipRecordGetSuccessAfterScreeningACCT = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome('', {
      code: 'ACCT_SUPPORT',
      description: 'Support through ACCT',
    }),
  )
}

const stubCsipRecordGetSuccessAfterScreeningSupportOutsideCsip = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome('', {
      code: 'SUPPORT_OUTSIDE_CSIP',
      description: 'Support outside of CSIP',
    }),
  )
}

const csipRecordWithScreeningOutcome = (
  reason: string,
  status: { code: string; description: string } = {
    code: 'INVESTIGATION_PENDING',
    description: 'Investigation pending',
  },
) => {
  return {
    ...basicCsip,
    status,
    referral: {
      ...basicCsip.referral,
      referralCompletedByDisplayName: undefined,
      saferCustodyScreeningOutcome: {
        date: '2024-08-01',
        recordedBy: 'TEST_USER',
        recordedByDisplayName: 'Test User',
        reasonForDecision: reason,
        outcome: { code: 'OPE', description: 'Progress to investigation' },
      },
    },
  }
}

const stubCsipRecordGetSuccessCFEdgeCases = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...basicCsip,
    referral: {
      ...basicCsip.referral,
      contributoryFactors: [
        {
          factorType: { code: 'B', description: 'TextB' },
          factorUuid: '111-bbb',
          comment: `commentB`,
        },
        {
          factorType: { code: 'A', description: 'TextA' },
          factorUuid: '111-aaa',
          comment: 'commentA',
        },
        {
          factorType: { code: 'C', description: 'TextC1' },
          factorUuid: '111-ccc',
          comment: 'commentC',
        },
        {
          factorType: { code: 'C', description: 'TextC1' },
          factorUuid: '111-ccc',
          comment: 'AcommentC',
        },
        {
          factorType: { code: 'C', description: 'TextC3' },
          factorUuid: '111-ccc',
        },
        {
          factorType: { code: 'D', description: 'TextD1' },
          factorUuid: '111-ccc',
        },
        {
          factorType: { code: 'D', description: 'TextD2' },
          factorUuid: '111-ccc',
        },
      ],
    },
  })
}

const stubPutSaferCustodyScreening = () => {
  return createBasicHttpStub('PUT', `/csip-api/csip-records/${uuidRegex}/referral/safer-custody-screening`, 200, {
    outcome: {
      code: 'string',
      description: 'string',
      listSequence: 3,
      deactivatedAt: '2024-08-02T10:16:01.374Z',
    },
    recordedBy: 'string',
    recordedByDisplayName: 'string',
    date: '2021-09-27',
    reasonForDecision: 'string',
  })
}

const stubPostInvestigation = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/referral/investigation`, 200)
}

const stubPostReview = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/plan/reviews`, 200)
}

const stubPatchInvestigationSuccess = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/${uuidRegex}/referral/investigation`, 200)
}

const stubPatchInvestigationFail = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/${uuidRegex}/referral/investigation`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPutDecisionSuccess = () => {
  return createBasicHttpStub('PUT', `/csip-api/csip-records/${uuidRegex}/referral/decision-and-actions`, 200)
}

const stubPutDecisionSuccessNomis = () => {
  return stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/csip-api/csip-records/${uuidRegex}/referral/decision-and-actions`,
      bodyPatterns: [
        {
          doesNotMatch: '.*"signedOffByRoleCode".*',
        },
      ],
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })
}

const stubPutDecisionFail = () => {
  return createBasicHttpStub('PUT', `/csip-api/csip-records/${uuidRegex}/referral/decision-and-actions`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPostPlan = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/plan`, 200)
}

const stubPatchPlanSuccess = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/${uuidRegex}/plan`, 200)
}

const stubPatchIdentifiedNeedSuccess = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/plan/identified-needs/${uuidRegex}`, 200)
}

const stubPutDecision = () => {
  return createBasicHttpStub('PUT', `/csip-api/csip-records/${uuidRegex}/referral/decision-and-actions`, 200)
}

const stubPatchContributoryFactorSuccess = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/referral/contributory-factors/${uuidRegex}`, 200)
}

const stubPatchContributoryFactorFail = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/referral/contributory-factors/${uuidRegex}`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPostInterviewSuccess = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/referral/investigation/interviews`, 201)
}

const stubPostInterviewFail = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/referral/investigation/interviews`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchPlanFail = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/${uuidRegex}/plan`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchIdentifiedNeedFail = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/plan/identified-needs/${uuidRegex}`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchInterviewSuccess = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/referral/investigation/interviews/${uuidRegex}`, 200)
}

const stubPatchInterviewFail = () => {
  return createBasicHttpStub('PATCH', `/csip-api/csip-records/referral/investigation/interviews/${uuidRegex}`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPostIdentifiedNeedSuccess = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/plan/identified-needs`, 201)
}

const stubPostIdentifiedNeedFail = () => {
  return createBasicHttpStub('POST', `/csip-api/csip-records/${uuidRegex}/plan/identified-needs`, 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchReviewSuccess = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/plan/reviews/[a-zA-Z0-9-]+', 200)
}

const stubPatchReviewFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/plan/reviews/[a-zA-Z0-9-]+', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchAttendeeSuccess = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/plan/reviews/attendees/[a-zA-Z0-9-]+', 200)
}

const stubPatchAttendeeFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/plan/reviews/attendees/[a-zA-Z0-9-]+', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPostNewAttendeeSuccess = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/plan/reviews/[a-zA-Z0-9-]+/attendees', 201)
}

const stubPostNewAttendeeFail = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/plan/reviews/[a-zA-Z0-9-]+/attendees', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const createMockSearchCsipRecord = (params: Partial<CsipSearchResults['content']['0']>) => {
  return {
    id: params.id ?? '12345678-1234-1234-1234-123456789012',
    referralDate: params.referralDate ?? '2025-03-01',
    nextReviewDate: params.nextReviewDate ?? '2025-03-01',
    caseManager: params.caseManager ?? 'John Smith',
    status: params.status ?? { code: 'CSIP_CLOSED', description: 'CSIP closed' },
    prisoner: params.prisoner ?? { prisonNumber: 'A1234CD', firstName: 'John', lastName: 'Smith', location: '1-2-3' },
    logCode: params.logCode ?? 'LEI123',
    incidentType: params.incidentType ?? '',
    ...params,
  }
}

const stubSearchCsipRecordsPrisonerCsips = () => {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 1)
  const prisoner = { prisonNumber: 'A1111AA', firstName: "Tes'Name", lastName: 'User' }
  return createHttpStub(
    'GET',
    '/csip-api/search/csip-records',
    {
      page: { matches: '.*' },
      size: { equalTo: '25' },
      query: { matches: '.*' },
      sort: { matches: '.*' },
    },
    undefined,
    200,
    {
      content: [
        createMockSearchCsipRecord({ prisoner, caseManager: 'Overdue Manager' }),
        createMockSearchCsipRecord({
          prisoner,
          caseManager: 'Soon Due Manager',
          nextReviewDate: reviewDate.toISOString().substring(0, 10),
          status: { code: 'CSIP_OPEN', description: 'CSIP open' },
        }),
        createMockSearchCsipRecord({
          prisoner,
          status: { code: 'AWAITING_DECISION', description: 'Awaiting decision' },
        }),
        createMockSearchCsipRecord({ prisoner, status: { code: 'PLAN_PENDING', description: 'Plan pending' } }),
        createMockSearchCsipRecord({
          prisoner,
          status: { code: 'INVESTIGATION_PENDING', description: 'Investigation pending' },
        }),
        createMockSearchCsipRecord({
          prisoner,
          status: { code: 'REFERRAL_SUBMITTED', description: 'Referral submitted' },
        }),
        createMockSearchCsipRecord({ prisoner, status: { code: 'REFERRAL_PENDING', description: 'Referral pending' } }),
        createMockSearchCsipRecord({
          prisoner,
          status: { code: 'NO_FURTHER_ACTION', description: 'No further action' },
        }),
        createMockSearchCsipRecord({
          prisoner,
          status: { code: 'SUPPORT_OUTSIDE_CSIP', description: 'Support outside of CSIP' },
        }),
      ],
      metadata: {
        totalElements: 100,
      },
    },
  )
}

const stubSearchCsipRecords = () => {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 1)
  return createHttpStub(
    'GET',
    '/csip-api/search/csip-records',
    {
      page: { matches: '.*' },
      size: { equalTo: '25' },
      prisonCode: { equalTo: 'LEI' },
      query: { matches: '.*' },
      status: {
        equalTo:
          'NO_FURTHER_ACTION,SUPPORT_OUTSIDE_CSIP,CSIP_OPEN,CSIP_CLOSED,AWAITING_DECISION,PLAN_PENDING,INVESTIGATION_PENDING,REFERRAL_SUBMITTED,REFERRAL_PENDING',
      },
      sort: { matches: '.*' },
    },
    undefined,
    200,
    {
      content: [
        createMockSearchCsipRecord({ caseManager: 'Overdue Manager' }),
        createMockSearchCsipRecord({
          caseManager: 'Soon Due Manager',
          nextReviewDate: reviewDate.toISOString().substring(0, 10),
          status: { code: 'CSIP_OPEN', description: 'CSIP open' },
        }),
        createMockSearchCsipRecord({ status: { code: 'AWAITING_DECISION', description: 'Awaiting decision' } }),
        createMockSearchCsipRecord({ status: { code: 'PLAN_PENDING', description: 'Plan pending' } }),
        createMockSearchCsipRecord({ status: { code: 'INVESTIGATION_PENDING', description: 'Investigation pending' } }),
        createMockSearchCsipRecord({ status: { code: 'REFERRAL_SUBMITTED', description: 'Referral submitted' } }),
        createMockSearchCsipRecord({ status: { code: 'REFERRAL_PENDING', description: 'Referral pending' } }),
        createMockSearchCsipRecord({ status: { code: 'NO_FURTHER_ACTION', description: 'No further action' } }),
        createMockSearchCsipRecord({
          status: { code: 'SUPPORT_OUTSIDE_CSIP', description: 'Support outside of CSIP' },
        }),
      ],
      metadata: {
        totalElements: 100,
      },
    },
  )
}

const stubSearchCsipRecordsClosed = () => {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 1)
  return createHttpStub(
    'GET',
    '/csip-api/search/csip-records',
    {
      page: { matches: '.*' },
      size: { equalTo: '25' },
      prisonCode: { equalTo: 'LEI' },
      query: { matches: '.*' },
      status: { equalTo: 'CSIP_CLOSED' },
      sort: { matches: '.*' },
    },
    undefined,
    200,
    {
      content: [createMockSearchCsipRecord({ caseManager: 'Overdue Manager' })],
      metadata: {
        totalElements: 100,
      },
    },
  )
}

const stubSearchCsipRecordsOpen = () => {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 1)
  return createHttpStub(
    'GET',
    '/csip-api/search/csip-records',
    {
      page: { matches: '.*' },
      size: { equalTo: '25' },
      prisonCode: { equalTo: 'LEI' },
      query: { matches: '.*' },
      status: { equalTo: 'CSIP_OPEN' },
      sort: { matches: '.*' },
    },
    undefined,
    200,
    {
      content: [
        createMockSearchCsipRecord({
          caseManager: 'Soon Due Manager',
          nextReviewDate: reviewDate.toISOString().substring(0, 10),
          status: { code: 'CSIP_OPEN', description: 'CSIP open' },
        }),
      ],
      metadata: {
        totalElements: 100,
      },
    },
  )
}

const stubSearchCsipRecordsPlans = () => {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 1)
  return createHttpStub(
    'GET',
    '/csip-api/search/csip-records',
    {
      page: { matches: '.*' },
      size: { equalTo: '25' },
      prisonCode: { equalTo: 'LEI' },
      query: { matches: '.*' },
      status: { equalTo: 'CSIP_OPEN,CSIP_CLOSED' },
      sort: { matches: '.*' },
    },
    undefined,
    200,
    {
      content: [
        createMockSearchCsipRecord({ caseManager: 'Overdue Manager' }),
        createMockSearchCsipRecord({
          caseManager: 'Soon Due Manager',
          nextReviewDate: reviewDate.toISOString().substring(0, 10),
          status: { code: 'CSIP_OPEN', description: 'CSIP open' },
        }),
      ],
      metadata: {
        totalElements: 100,
      },
    },
  )
}

const stubSearchCsipRecordsReferrals = () => {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 1)
  return createHttpStub(
    'GET',
    '/csip-api/search/csip-records',
    {
      page: { matches: '.*' },
      size: { equalTo: '25' },
      prisonCode: { equalTo: 'LEI' },
      query: { matches: '.*' },
      status: { equalTo: 'AWAITING_DECISION,PLAN_PENDING,INVESTIGATION_PENDING,REFERRAL_SUBMITTED,REFERRAL_PENDING' },
      sort: { matches: '.*' },
    },
    undefined,
    200,
    {
      content: [
        createMockSearchCsipRecord({
          incidentType: 'Abuse',
          status: { code: 'AWAITING_DECISION', description: 'Awaiting decision' },
        }),
        createMockSearchCsipRecord({
          incidentType: 'Abuse',
          status: { code: 'PLAN_PENDING', description: 'Plan pending' },
        }),
        createMockSearchCsipRecord({
          incidentType: 'Abuse',
          status: { code: 'INVESTIGATION_PENDING', description: 'Investigation pending' },
        }),
        createMockSearchCsipRecord({
          incidentType: 'Abuse',
          status: { code: 'REFERRAL_SUBMITTED', description: 'Referral submitted' },
        }),
        createMockSearchCsipRecord({
          incidentType: 'Abuse',
          status: { code: 'REFERRAL_PENDING', description: 'Referral pending' },
        }),
      ],
      metadata: {
        totalElements: 100,
      },
    },
  )
}

const stubSearchCsipRecordsFail = () => {
  return createBasicHttpStub('GET', '/csip-api/search/csip-records.*', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubGetCsipOverview = () => {
  const reviewDate = new Date()
  reviewDate.setDate(reviewDate.getDate() + 1)
  return createBasicHttpStub('GET', '/csip-api/prisons/LEI/csip-records/overview', 200, {
    counts: {
      submittedReferrals: 1,
      pendingInvestigations: 1,
      awaitingDecisions: 1,
      pendingPlans: 1,
      open: 1,
      overdueReviews: 1,
    },
  })
}

const stubCurrentCsipStatusOnCsip = () => {
  return createBasicHttpStub('GET', '/csip-api/prisoners/[a-zA-Z0-9]*/csip-records/current', 200, {
    totalOpenedCsipCount: 1,
    totalReferralCount: 1,
    currentCsip: {
      status: {
        code: 'CSIP_OPEN',
      },
    },
  })
}

const stubCurrentCsipStatusExistingReferral = () => {
  return createBasicHttpStub('GET', '/csip-api/prisoners/[a-zA-Z0-9]*/csip-records/current', 200, {
    totalOpenedCsipCount: 1,
    totalReferralCount: 1,
    currentCsip: {
      status: {
        code: 'REFERRAL_SUBMITTED',
      },
    },
  })
}

export const stubCurrentCsipStatusNoCsip = () => {
  return createBasicHttpStub('GET', '/csip-api/prisoners/[a-zA-Z0-9]*/csip-records/current', 200, {
    totalOpenedCsipCount: 0,
    totalReferralCount: 0,
  })
}

export const basicCsip = {
  recordUuid: '02e5854f-f7b1-4c56-bec8-69e390eb8550',
  prisonNumber: 'A1111AA',
  prisonCodeWhenRecorded: 'LEI',
  logCode: 'LEI123',
  createdAt: '2024-07-22T11:21:48',
  createdBy: 'AHUMAN_GEN',
  createdByDisplayName: 'A Human',
  status: {
    code: 'REFERRAL_SUBMITTED',
    description: 'Referral submitted',
  },
  referral: {
    isReferralComplete: true,
    referralDate: '2024-08-01',
    isOnBehalfOfReferral: true,
    referredBy: '<script>alert("Test User")</script>',
    refererArea: { code: 'A', description: '<script>alert("Area")</script>' },
    referralCompletedByDisplayName: 'Test User',
    isProactiveReferral: true,
    incidentLocation: { code: 'A', description: '<script>alert("Location")</script>' },
    incidentType: { code: 'A', description: '<script>alert("IncidentType")</script>' },
    incidentDate: '2024-12-25',
    incidentTime: '23:59:00',
    incidentInvolvement: { code: 'CODE1', description: '<script>alert("Involvement")</script>' },
    isStaffAssaulted: true,
    assaultedStaffName: '<script>alert("Staff Name")</script>',
    descriptionOfConcern: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('concerns');</script>
    
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
        factorUuid: 'b8dff21f-e96c-4240-aee7-28900dd910f1',
        factorType: { code: 'CODE3', description: 'Text' },
      },
      {
        factorUuid: 'b8dff21f-e96c-4240-aee7-28900dd910f2',
        factorType: { code: 'CODE1', description: '<script>alert("Text for type-B")</script>' },
        comment: `Text

        • Bullet 1
        • Bullet 2
        • Bullet 3
        
        Paragraph
        
        <script>alert('xss');</script>
        
        <button>factor comment button should be escaped</button>`,
      },
      {
        factorUuid: 'b8dff21f-e96c-4240-aee7-28900dd910f3',
        factorType: { code: `CODE4`, description: 'Text with a TLA' },
      },
    ],
    isSaferCustodyTeamInformed: YES_NO_ANSWER.Enum.YES,
    otherInformation: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('xss');</script>
    
    <button>otherinfo button should be escaped</button>`,
  },
}

const csipOpen: components['schemas']['CsipRecord'] = {
  ...basicCsip,
  status: {
    code: 'CSIP_OPEN',
    description: 'CSIP open',
  },
  referral: {
    ...basicCsip.referral,
    saferCustodyScreeningOutcome: {
      history: [],
      outcome: { code: 'OPE', description: 'Progress to investigation' },
      recordedBy: 'Test User',
      recordedByDisplayName: 'Test',
      date: '2024-08-01',
      reasonForDecision: 'a very well thought out reason',
    },
    investigation: {
      interviews: [
        {
          interviewUuid: '580a16c3-72f2-4243-a0e6-847911e3ae2b',
          interviewee: 'Some Person',
          interviewDate: '2024-12-25',
          intervieweeRole: { code: 'B', description: 'Role2' },
          interviewText: 'some text',
        },
      ],
      staffInvolved: 'staff stafferson',
      evidenceSecured: 'SomeVidence',
      occurrenceReason: 'bananas',
      personsUsualBehaviour: 'a great person',
      personsTrigger: 'spiders',
      protectiveFactors: 'SomeFactors',
    },
    decisionAndActions: {
      history: [],
      conclusion: 'dec-conc',
      outcome: { code: 'ACC', description: 'Another option' },
      signedOffByRole: {
        code: 'A',
        description: 'prison officer',
      },
      recordedBy: 'some person',
      recordedByDisplayName: 'some person longer',
      date: '2024-08-01',
      nextSteps: `stuff up
          and there
          
          whilst also being down here`,
      actions: ['OPEN_CSIP_ALERT'],
      actionOther: `some action
          with another one
          
          a final action`,
    },
  },
  plan: {
    reviews: [
      {
        reviewDate: '2024-04-05',
        actions: ['REMAIN_ON_CSIP'],
        summary: 'a summary',
        recordedByDisplayName: 'joe bloggs',
        attendees: [
          {
            attendeeUuid: 'attendee-uuid-2',
            name: 'Attendee Alt',
            role: 'another role text',
            isAttended: false,
          },
        ],
      } as NonNullable<components['schemas']['CsipRecord']['plan']>['reviews'][0],
      {
        reviewDate: '2024-04-15',
        actions: ['REMAIN_ON_CSIP'],
        summary: 'even longer',
        recordedByDisplayName: 'test testerson',
        nextReviewDate: '2025-04-15',
        attendees: [
          {
            attendeeUuid: 'attendee-uuid-1',
            name: 'Attendee Name',
            role: 'role text',
            isAttended: true,
            contribution: 'contribution text',
          },
        ],
      } as NonNullable<components['schemas']['CsipRecord']['plan']>['reviews'][0],
    ],
    caseManager: 'some person',
    reasonForPlan: 'plan reason',
    nextCaseReviewDate: '2024-05-25',
    createdAt: '2024-04-03',
    firstCaseReviewDate: '2024-04-20',
    identifiedNeeds: [
      {
        identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0001',
        identifiedNeed: 'closed need',
        responsiblePerson: 'joe bloggs',
        createdDate: '2024-04-01',
        targetDate: '2024-06-02',
        closedDate: '2024-05-01',
        intervention: 'we need to do things',
      },
      {
        identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0002',
        identifiedNeed: 'second need',
        responsiblePerson: 'foo barerson',
        createdDate: '2024-04-01',
        targetDate: '2024-06-01',
        intervention: 'int1',
        progression: 'almost there',
      },
      {
        identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0003',
        identifiedNeed: 'first need',
        responsiblePerson: 'test testerson',
        createdDate: '2024-03-01',
        targetDate: '2024-04-02',
        intervention: 'get it sorted',
        progression: 'progression done',
      },
    ],
  },
}

const planPendingBody: components['schemas']['CsipRecord'] = {
  ...basicCsip,
  status: {
    code: 'PLAN_PENDING',
    description: 'Plan pending',
  },
  referral: {
    ...basicCsip.referral,
    saferCustodyScreeningOutcome: {
      history: [],
      outcome: { code: 'NFA', description: 'No further action' },
      recordedBy: 'Test User',
      recordedByDisplayName: 'Test',
      date: '2024-08-01',
      reasonForDecision: 'a very well thought out reason',
    },
    investigation: {
      interviews: [
        {
          interviewUuid: '580a16c3-72f2-4243-a0e6-847911e3ae2b',
          interviewee: 'Some Person',
          interviewDate: '2024-12-25',
          intervieweeRole: { code: 'B', description: 'Role2' },
          interviewText: 'some text',
        },
      ],
      staffInvolved: 'staff stafferson',
      evidenceSecured: 'SomeVidence',
      occurrenceReason: 'bananas',
      personsUsualBehaviour: 'a great person',
      personsTrigger: 'spiders',
      protectiveFactors: 'SomeFactors',
    },
    decisionAndActions: {
      history: [],
      conclusion: 'dec-conc',
      outcome: { code: 'ACC', description: 'Another option' },
      signedOffByRole: {
        code: 'A',
        description: 'prison officer',
      },
      recordedBy: 'some person',
      recordedByDisplayName: 'some person longer',
      date: '2024-08-01',
      nextSteps: `stuff up
          and there
          
          whilst also being down here`,
      actions: ['OPEN_CSIP_ALERT'],
      actionOther: `some action
          with another one
          
          a final action`,
    },
  },
}

const stubCsipRecordSuccessCsipOpen = (reviews = csipOpen.plan!.reviews) => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...csipOpen,
    plan: { ...csipOpen.plan, reviews },
  })
}

export default {
  stubAreaOfWork,
  stubIncidentLocation,
  stubIncidentType,
  stubIntervieweeRoles,
  stubDecisionSignerRoles,
  stubIncidentInvolvement,
  stubContribFactors,
  stubOneContribFactor,
  stubCsipRecordPostSuccess,
  stubCsipRecordPostFailure,
  stubDecisionOutcomeType,
  stubScreeningOutcomeType,
  stubCsipRecordGetSuccess,
  stubPutSaferCustodyScreening,
  stubPostInvestigation,
  stubPatchInvestigationSuccess,
  stubPatchInvestigationFail,
  stubPostPlan,
  stubCsipRecordSuccessAwaitingDecision,
  stubCsipRecordSuccessAwaitingDecisionNoInterviews,
  stubCsipRecordSuccessPlanPending,
  stubCsipRecordSuccessCsipOpen,
  stubPutDecision,
  stubCsipRecordPatchSuccess,
  stubCsipRecordPatchFail,
  stubContributoryFactorPostSuccess,
  stubCsipRecordGetSuccessCFEdgeCases,
  stubCsipRecordGetSuccessAfterScreeningWithReason,
  stubCsipRecordGetSuccessAfterScreeningWithoutReason,
  stubCsipRecordGetSuccessAfterScreeningNFA,
  stubCsipRecordGetSuccessAfterScreeningACCT,
  stubCsipRecordGetSuccessAfterScreeningSupportOutsideCsip,
  stubPatchContributoryFactorSuccess,
  stubPatchContributoryFactorFail,
  stubPostInterviewSuccess,
  stubPostInterviewFail,
  stubPatchInterviewSuccess,
  stubPatchInterviewFail,
  stubPutDecisionSuccess,
  stubPutDecisionFail,
  stubPatchPlanSuccess,
  stubPatchPlanFail,
  stubPatchIdentifiedNeedSuccess,
  stubPatchIdentifiedNeedFail,
  stubPostIdentifiedNeedSuccess,
  stubPostIdentifiedNeedFail,
  stubPostReview,
  stubPatchReviewSuccess,
  stubPatchReviewFail,
  stubPatchAttendeeSuccess,
  stubPatchAttendeeFail,
  stubPostNewAttendeeSuccess,
  stubPostNewAttendeeFail,
  stubSearchCsipRecords,
  stubSearchCsipRecordsFail,
  stubGetCsipOverview,
  stubGetServiceInfoOneAgencyLEI,
  stubGetServiceInfoOneAgencyMDI,
  stubGetServiceInfoNoAgencies,
  stubGetServiceInfoAllAgencies,
  stubCurrentCsipStatusOnCsip,
  stubCurrentCsipStatusNoCsip,
  stubCsipRecordGetSuccessReferralPending,
  stubCsipRecordGetSuccessReferralPendingMatchingReferrer,
  stubCsipRecordPutSuccess,
  stubCurrentCsipStatusExistingReferral,
  stubCsipRecordSuccessPlanPendingCUR,
  stubCsipRecordSuccessPlanPendingNomis,
  stubPutDecisionSuccessNomis,
  stubSearchCsipRecordsClosed,
  stubSearchCsipRecordsPlans,
  stubSearchCsipRecordsReferrals,
  stubSearchCsipRecordsOpen,
  stubStatus,
  stubCsipRecordGetSuccessAfterScreeningWithHistory,
  stubCsipRecordSuccessPlanPendingWithDecisionHistory,
  stubCsipRecordSuccessCsipOpenWith,
  stubSearchCsipRecordsPrisonerCsips,
}
