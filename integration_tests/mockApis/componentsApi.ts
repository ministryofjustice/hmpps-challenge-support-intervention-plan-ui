import { stubFor } from './wiremock'

const stubComponents = () => {
  return stubFor({
    request: {
      method: 'GET',
      url: '/components/components?component=header&component=footer',
    },
    response: {
      status: 500,
    },
  })
}

export default {
  stubComponents,
}
