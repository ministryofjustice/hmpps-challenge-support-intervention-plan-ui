import fs from 'fs'
import path from 'path'
import nunjucks from 'nunjucks'
import { Request, Response } from 'express'
import { StartJourneyController } from '../routes/journeys/start/controller'
import PrisonerSearchService from '../services/prisonerSearch/prisonerSearchService'
import CsipApiService from '../services/csipApi/csipApiService'

describe('DPS navigation', () => {
  const homepages = [
    'https://dps-dev.prison.service.justice.gov.uk',
    'https://dps-preprod.prison.service.justice.gov.uk',
    'https://dps.prison.service.justice.gov.uk',
  ]

  it.each(homepages)('links referral guidance directly to prisoner search on %s', homepage => {
    const templates = new nunjucks.Environment({
      getSource: () => ({
        src: '{% block innerContent %}{% endblock %}',
        path: 'partials/layout.njk',
        noCache: true,
      }),
    })
    const template = fs.readFileSync(path.join(__dirname, '../routes/how-to-make-a-referral/view.njk'), 'utf8')

    const html = templates.renderString(template, { digitalPrisonServicesUrl: homepage })

    expect(html).toContain(`href="${homepage}/prisoner-search"`)
  })

  it.each(homepages)('redirects a missing prisoner directly to prisoner search on %s', async homepage => {
    const notFound = Object.assign(new Error('Prisoner not found'), { status: 404 })
    const prisonerSearchService = {
      getPrisonerDetails: jest.fn().mockRejectedValue(notFound),
    } as unknown as PrisonerSearchService
    const controller = new StartJourneyController({} as CsipApiService, prisonerSearchService)
    const req = {
      params: { journeyId: 'test-journey', prisonerNumber: 'A1111AA' },
    } as unknown as Request
    const res = {
      locals: { digitalPrisonServicesUrl: homepage },
      redirect: jest.fn(),
    } as unknown as Response

    await controller.redirectWithPrisonerData('/referral')(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`${homepage}/prisoner-search`)
  })
})
