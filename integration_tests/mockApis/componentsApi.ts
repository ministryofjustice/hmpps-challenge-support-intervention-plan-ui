import { stubFor } from './wiremock'

const ping = (status = 200) =>
  stubFor({
    priority: 6,
    request: {
      method: 'GET',
      urlPattern: '/components/health',
    },
    response: {
      status,
    },
  })

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
              description: 'Leeds (HMP)',
              currentlyActive: true,
            },
          ],
          activeCaseLoad: {
            caseLoadId: 'LEI',
            description: 'Leeds (HMP)',
            currentlyActive: true,
          },
          services: [
            {
              id: 'csipUI',
              heading: 'CSIP',
              description: 'View and manage the Challenge, Support and Intervention Plan (CSIP) caseload.',
              href: 'https://csip-dev.hmpps.service.justice.gov.uk',
              navEnabled: true,
            },
          ],
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

const stubComponentsNoCsip = () => {
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
              description: 'Leeds (HMP)',
              currentlyActive: true,
            },
          ],
          activeCaseLoad: {
            caseLoadId: 'LEI',
            description: 'Leeds (HMP)',
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
  stubComponentsPing: ping,
  stubComponents,
  stubComponentsNoCsip,
  stubComponentsFail,
}
