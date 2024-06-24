import { stubFor } from './wiremock'

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
        firstName: 'Neil',
        lastName: 'Rudge',
        prisonerNumber: 'A1111AA',
        dateOfBirth: '1932-02-02',
        status: 'On remand',
        prisonName: 'HMP Kirkham',
        cellLocation: 'A-1-1',
      },
    },
  })
}

export default {
  stubGetPrisoner,
}
