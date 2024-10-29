import { RequestHandler, Router } from 'express'
import logger from '../../logger'
import PrisonApiService from '../services/prisonApi/prisonApiService'
import CsipApiService from '../services/csipApi/csipApiService'
import { ServiceConfigInfo } from '../services/csipApi/csipApiClient'
import { CaseLoad } from '../interfaces/caseLoad'

export default function checkPopulateUserCaseloads(
  prisonApiService: PrisonApiService,
  csipApiService: CsipApiService,
): RequestHandler {
  const router = Router()

  router.get('/service-not-enabled', (_req, res) => {
    res.status(200)
    res.render('service-not-enabled')
  })

  router.use(async (req, res, next) => {
    const splitUrl = req.url.split('/').filter(Boolean)
    if (
      !splitUrl[0]?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) &&
      !req.url.endsWith('/start') &&
      !req.url.includes('prisoner-image') &&
      !req.url.includes('service-not-enabled')
    ) {
      try {
        if (res.locals.feComponentsMeta?.caseLoads) {
          req.session.userCaseloads = res.locals.feComponentsMeta.caseLoads
        }
        const refetchCaseloads = !req.session.userCaseloads || req.session.userCaseloads.length > 1
        const promises = refetchCaseloads
          ? [csipApiService.getServiceConfigInfo(req), prisonApiService.getCaseLoads(req)]
          : [csipApiService.getServiceConfigInfo(req)]
        const [configInfo, caseloads] = await Promise.all(promises)
        if (refetchCaseloads) {
          req.session.userCaseloads = caseloads as CaseLoad[]
        }
        // Check that the user's active caseload is enabled on the API side
        if (
          !(configInfo as ServiceConfigInfo).activeAgencies.includes(
            req.session.userCaseloads!.find(caseload => caseload.currentlyActive)?.caseLoadId || '',
          )
        ) {
          res.redirect('/service-not-enabled')
          return
        }
      } catch (error) {
        logger.error(error, `Failed to get caseloads for: ${res.locals.user.username}`)
        next(error)
      }
    }
    next()
  })
  return router
}
