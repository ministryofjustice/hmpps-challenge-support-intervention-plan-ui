import { stubFor } from './wiremock'
import { YES_NO_ANSWER } from '../../server/routes/journeys/referral/safer-custody/schemas'

const createBasicHttpStub = (method: string, urlPattern: string, status: number, jsonBody: object = {}) => {
  return stubFor({
    request: { method, urlPattern },
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
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/[a-zA-Z0-9-]*', 200, {})
}

const stubCsipRecordPatchFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/[a-zA-Z0-9-]*', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubContributoryFactorPostSuccess = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/contributory-factors', 201, {})
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
    ...csip,
    status: 'AWAITING_DECISION',
    referral: {
      ...csip.referral,
      investigation: {
        interviews: [
          {
            interviewee: 'Another Person',
            interviewDate: '2024-12-29',
            intervieweeRole: { code: 'A', description: 'Role1' },
            interviewText: 'some text',
          },
          {
            interviewee: 'Some Person',
            interviewDate: '2024-12-25',
            intervieweeRole: { code: 'B', description: 'Role2' },
            interviewText: 'other stuff',
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
  })
}

const stubCsipRecordSuccessAwaitingDecisionNoInterviews = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...csip,
    status: 'AWAITING_DECISION',
    referral: {
      ...csip.referral,
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

const stubCsipRecordSuccessPlanPending = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...csip,
    status: 'PLAN_PENDING',
    referral: {
      ...csip.referral,
      investigation: {
        interviews: [
          {
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
  })
}

const stubCsipRecordSuccessCsipOpen = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...csip,
    status: 'CSIP_OPEN',
    referral: {
      ...csip.referral,
      investigation: {
        interviews: [
          {
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
          actions: 'some actions',
          summary: 'a summary',
          recordedByDisplayName: 'joe bloggs',
        },
        {
          reviewDate: '2024-04-15',
          actions: 'other stuff',
          summary: 'even longer',
          recordedByDisplayName: 'test testerson',
        },
      ],
      caseManager: 'some person',
      reasonForPlan: 'plan reason',
      nextCaseReviewDate: '2024-05-25',
      identifiedNeeds: [
        {
          identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0001',
          identifiedNeed: 'closed need',
          responsiblePerson: 'joe bloggs',
          createdDate: '2024-04-01',
          targetDate: '2024-06-02',
          closedDate: '2024-05-01',
          intervention: 'we need to do things',
          progression: null,
        },
        {
          identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0002',
          identifiedNeed: 'second need',
          responsiblePerson: 'foo barerson',
          createdDate: '2024-04-01',
          targetDate: '2024-06-01',
          closedDate: null,
          intervention: 'int1',
          progression: 'almost there',
        },
        {
          identifiedNeedUuid: 'a0000000-f7b1-4c56-bec8-69e390eb0003',
          identifiedNeed: 'first need',
          responsiblePerson: 'test testerson',
          createdDate: '2024-03-01',
          targetDate: '2024-04-02',
          closedDate: null,
          intervention: 'get it sorted',
          progression: 'progression done',
        },
      ],
    },
  })
}

const stubCsipRecordGetSuccess = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, csip)
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

const stubCsipRecordGetSuccessAfterScreeningNFA = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome('', 'NO_FURTHER_ACTION'),
  )
}

const stubCsipRecordGetSuccessAfterScreeningACCT = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome('', 'ACCT_SUPPORT'),
  )
}

const stubCsipRecordGetSuccessAfterScreeningSupportOutsideCsip = () => {
  return createBasicHttpStub(
    'GET',
    '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    200,
    csipRecordWithScreeningOutcome('', 'SUPPORT_OUTSIDE_CSIP'),
  )
}

const csipRecordWithScreeningOutcome = (reason: string, status: string = 'INVESTIGATION_PENDING') => {
  return {
    ...csip,
    status,
    referral: {
      ...csip.referral,
      saferCustodyScreeningOutcome: {
        date: '2024-08-01',
        recordedBy: 'TEST_USER',
        recordedByDisplayName: 'Test User',
        reasonForDecision: reason,
        outcome: { code: 'E2E', description: 'Progress to investigation' },
      },
    },
  }
}

const stubCsipRecordGetSuccessCFEdgeCases = () => {
  return createBasicHttpStub('GET', '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550', 200, {
    ...csip,
    referral: {
      ...csip.referral,
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

const stubPostSaferCustodyScreening = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/safer-custody-screening', 200, {
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
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/investigation', 200)
}

const stubPatchInvestigationSuccess = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/investigation', 200)
}

const stubPatchInvestigationFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/investigation', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPutDecisionSuccess = () => {
  return createBasicHttpStub('PUT', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/decision-and-actions', 200)
}

const stubPutDecisionFail = () => {
  return createBasicHttpStub('PUT', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/decision-and-actions', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPostPlan = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/plan', 200)
}

const stubPatchPlanSuccess = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/[a-zA-Z0-9-]*/plan', 200)
}

const stubPatchIdentifiedNeedSuccess = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/plan/identified-needs/[a-zA-Z0-9-]*', 200)
}

const stubPutDecision = () => {
  return createBasicHttpStub('PUT', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/decision-and-actions', 200)
}

const stubPatchContributoryFactorSuccess = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/referral/contributory-factors/[a-zA-Z0-9-]*', 200)
}

const stubPatchContributoryFactorFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/referral/contributory-factors/[a-zA-Z0-9-]*', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPostInterviewSuccess = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/investigation/interviews', 201)
}

const stubPostInterviewFail = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/referral/investigation/interviews', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchPlanFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/[a-zA-Z0-9-]*/plan', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchIdentifiedNeedFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/plan/identified-needs/[a-zA-Z0-9-]*', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPatchInterviewSuccess = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/referral/investigation/interviews/[a-zA-Z0-9-]*', 200)
}

const stubPatchInterviewFail = () => {
  return createBasicHttpStub('PATCH', '/csip-api/csip-records/referral/investigation/interviews/[a-zA-Z0-9-]*', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

const stubPostIdentifiedNeedSuccess = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/plan/identified-needs', 201)
}

const stubPostIdentifiedNeedFail = () => {
  return createBasicHttpStub('POST', '/csip-api/csip-records/[a-zA-Z0-9-]*/plan/identified-needs', 500, {
    userMessage: 'Simulated Error for E2E testing',
  })
}

export const csip = {
  recordUuid: '02e5854f-f7b1-4c56-bec8-69e390eb8550',
  prisonNumber: 'A1111AA',
  prisonCodeWhenRecorded: 'LEI',
  logCode: 'LEI123',
  createdAt: '2024-07-22T11:21:48',
  createdBy: 'AHUMAN_GEN',
  createdByDisplayName: 'A Human',
  status: 'REFERRAL_SUBMITTED',
  referral: {
    isOnBehalfOfReferral: true,
    referredBy: '<script>alert("Test User")</script>',
    refererArea: { code: 'A', description: '<script>alert("Area")</script>' },
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
  stubPostSaferCustodyScreening,
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
}
