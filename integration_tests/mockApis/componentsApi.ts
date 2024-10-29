import { stubFor } from './wiremock'

const stubComponentsFail = () => {
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

const stubComponents = () => {
  return stubFor({
    request: {
      method: 'GET',
      url: '/components/components?component=header&component=footer',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        meta: {
          caseLoads: [
            {
              caseLoadId: 'LEI',
              currentlyActive: true,
            },
          ],
          activeCaseLoad: {
            caseLoadId: 'LEI',
            currentlyActive: true,
          },
          services: [],
        },
        header: {
          html: '',
          css: [''],
          javascript: [''],
        },
        footer: {
          html: '',
          css: [''],
          javascript: [],
        },
      },
    },
  })
}

export default {
  stubComponents,
  stubComponentsFail,
}
