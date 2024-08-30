import { stubFor } from './wiremock'

const stubGetPrisonerImage = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/bookings/offenderNo/([a-zA-Z0-9]*)/image/data',
    },
    response: {
      status: 200,
      bodyFileName: 'assets/images/prisoner-profile-image.png',
      headers: {
        'Content-Type': 'image/png',
      },
    },
  })
}

export default {
  stubGetPrisonerImage,
}
