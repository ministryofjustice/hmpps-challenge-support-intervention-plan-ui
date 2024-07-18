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

export default {
  stubAreaOfWork,
  stubIncidentLocation,
  stubIncidentType,
  stubIncidentInvolvement,
  stubContribFactors,
}
