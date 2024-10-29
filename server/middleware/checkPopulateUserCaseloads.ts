import { RequestHandler, Router } from 'express'
import { validate as uuidValidate } from 'uuid'
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
      !uuidValidate(splitUrl[0] || '') &&
      !req.url.endsWith('/start') &&
      !req.url.includes('prisoner-image') &&
      !req.url.includes('service-not-enabled')
    ) {
      try {
        if (res.locals.feComponentsMeta?.caseLoads) {
          res.locals.user.caseloads = res.locals.feComponentsMeta.caseLoads
        }
        if (res.locals.feComponentsMeta?.activeCaseLoad) {
          res.locals.user.activeCaseLoadId = res.locals.feComponentsMeta.activeCaseLoad.caseLoadId
        }
        const refetchCaseloads = !res.locals.user.caseloads || res.locals.user.caseloads.length > 1
        const promises = refetchCaseloads
          ? [csipApiService.getServiceConfigInfo(req), prisonApiService.getCaseLoads(req)]
          : [csipApiService.getServiceConfigInfo(req)]
        const [configInfo, caseloads] = await Promise.all(promises)
        if (refetchCaseloads) {
          res.locals.user.caseloads = caseloads as CaseLoad[]
          res.locals.user.activeCaseLoadId =
            (caseloads as CaseLoad[])!.find(caseload => caseload.currentlyActive)?.caseLoadId ??
            res.locals.user.activeCaseLoadId
        }
        // Check that the user's active caseload is enabled on the API side
        if (
          !(configInfo as ServiceConfigInfo).activeAgencies.includes(
            res.locals.user.caseloads!.find(caseload => caseload.currentlyActive)?.caseLoadId || '',
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
