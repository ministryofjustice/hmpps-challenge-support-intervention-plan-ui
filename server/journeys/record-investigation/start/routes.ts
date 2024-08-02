import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import CsipApiService from '../../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { StartJourneyController } from '../../start/controller'

export default function StartJourneyRoutes(
  csipApiService: CsipApiService,
  prisonerSearchService: PrisonerSearchService,
): Router {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const controller = new StartJourneyController(csipApiService, prisonerSearchService)

  get('/csip-record/:csipRecordId/record-investigation/start', controller.redirectWithCsipData('/record-investigation'))

  return router
}
