import { stubFor } from './wiremock'

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisoner-search-api/health/ping',
    },
    response: {
      status: 200,
    },
  })

const stubGetPrisoner = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisoner-search-api/prisoner/A1111AA',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        prisonId: 'LEI',
        firstName: "Tes'Name",
        lastName: 'User',
        prisonerNumber: 'A1111AA',
        dateOfBirth: '1932-02-02',
        status: 'On remand',
        prisonName: 'HMP Kirkham',
        cellLocation: 'A-1-1',
      },
    },
  })
}

const stubGetPrisonerOutOfCaseLoad = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisoner-search-api/prisoner/NOCASELOAD',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        prisonId: 'MDI',
        firstName: "Tes'Name",
        lastName: 'User',
        prisonerNumber: 'NOCASELOAD',
        dateOfBirth: '1932-02-02',
        status: 'On remand',
        prisonName: 'HMP Kirkham',
        cellLocation: 'A-1-1',
      },
    },
  })
}

const stubGetPrisoner500 = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisoner-search-api/prisoner/A1111AA',
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })
}

const stubGetPrisoner404 = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisoner-search-api/prisoner/A1111AA',
    },
    response: {
      status: 404,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {},
    },
  })
}

export default {
  stubPrisonerSearchApiPing: ping,
  stubGetPrisoner,
  stubGetPrisonerOutOfCaseLoad,
  stubGetPrisoner500,
  stubGetPrisoner404,
}
