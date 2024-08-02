import { stubFor } from './wiremock'

const stubGetPrisonerImage = () => {
  return stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-api/api/bookings/offenderNo/A1111AA/image/data',
    },
    response: {
      status: 200,
      body: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      headers: {
        'Content-Type': 'image/png',
      },
    },
  })
}

export default {
  stubGetPrisonerImage,
}
