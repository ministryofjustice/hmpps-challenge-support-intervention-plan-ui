import { stubFor } from './wiremock'

const stubAreaOfWork = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/csip-api/reference-data/area-of-work',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
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
      ],
    },
  })
}

const stubIncidentLocation = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/csip-api/reference-data/incident-location',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
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
      ],
    },
  })
}

const stubIncidentType = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/csip-api/reference-data/incident-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
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
      ],
    },
  })
}

const stubContribFactors = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/csip-api/reference-data/contributory-factor-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
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
      ],
    },
  })
}

const stubIncidentInvolvement = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/csip-api/reference-data/incident-involvement',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
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
      ],
    },
  })
}

const stubCsipRecordPostFailure = () => {
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: '/csip-api/FAIL_POST/csip-records',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        status: 400,
        errorCode: null,
        userMessage: "Validation failure: Couldn't read request body",
        moreInfo: null,
      },
    },
  })
}

const stubCsipRecordPostSuccess = () => {
  return stubFor({
    request: {
      method: 'POST',
      urlPattern: '/csip-api/prisoners/[a-zA-Z0-9]*/csip-records',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
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
        plan: null,
      },
    },
  })
}

const stubOutcomeType = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/csip-api/reference-data/outcome-type',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        { code: 'NFA', description: 'No further action' },
        { code: 'ACC', description: 'Another option' },
      ],
    },
  })
}

const stubCsipRecordGetSuccess = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/csip-api/csip-records/02e5854f-f7b1-4c56-bec8-69e390eb8550',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        recordUuid: '02e5854f-f7b1-4c56-bec8-69e390eb8550',
        prisonNumber: 'A1111AA',
        prisonCodeWhenRecorded: 'LEI',
        createdAt: '2024-07-22T11:21:48',
        createdBy: 'AHUMAN_GEN',
        createdByDisplayName: 'A Human',
      },
    },
  })
}

export default {
  stubAreaOfWork,
  stubIncidentLocation,
  stubIncidentType,
  stubIncidentInvolvement,
  stubContribFactors,
  stubCsipRecordPostSuccess,
  stubCsipRecordPostFailure,
  stubOutcomeType,
  stubCsipRecordGetSuccess,
}
