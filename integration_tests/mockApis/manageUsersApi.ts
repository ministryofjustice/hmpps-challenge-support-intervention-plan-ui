import { stubFor } from './wiremock'

const stubUser = (name: string = 'john smith') =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manage-users-api/users/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        username: 'USER1',
        active: true,
        name,
      },
    },
  })

const ping = (status = 200) =>
  stubFor({
    priority: 6,
    request: {
      method: 'GET',
      urlPattern: '/manage-users-api/health/ping',
    },
    response: {
      status,
    },
  })

export default {
  stubManageUser: stubUser,
  stubManageUsersPing: ping,
}
