import { RequestHandler, Router } from 'express'
import { validate as uuidValidate } from 'uuid'
import logger from '../../logger'
import CsipApiService from '../services/csipApi/csipApiService'
import { ServiceConfigInfo } from '../services/csipApi/csipApiClient'

export default function checkServiceEnabledForActiveCaseLoad(csipApiService: CsipApiService): RequestHandler {
  const router = Router()

  router.get('/service-not-enabled', (_req, res) => {
    res.status(200)
    res.render('service-not-enabled')
  })

  router.use(async (req, res, next) => {
    const splitUrl = req.url.split('/').filter(Boolean)
    const services = res.locals.feComponents?.sharedData?.services
    let isEligibleForService = services ? services.find(service => service.id === 'csipUI') !== undefined : undefined
    try {
      // Check that the user's active caseload is enabled on the API side
      if (
        req.method === 'GET' &&
        !uuidValidate(splitUrl[0] || '') &&
        !req.url.endsWith('/start') &&
        !req.url.includes('prisoner-image') &&
        !req.url.includes('service-not-enabled')
      ) {
        if (isEligibleForService === undefined) {
          const configInfo = await csipApiService.getServiceConfigInfo(req)
          const { activeAgencies } = configInfo as ServiceConfigInfo
          isEligibleForService =
            activeAgencies.includes(
              res.locals.user.caseLoads!.find(caseload => caseload.currentlyActive)?.caseLoadId || '',
            ) || activeAgencies.includes('***')
        }
        if (!isEligibleForService) {
          res.redirect('/service-not-enabled')
          return
        }
      }
    } catch (error) {
      logger.error(error, `Failed to get caseloads for: ${res.locals.user.username}`)
      next(error)
    }
    next()
  })
  return router
}
