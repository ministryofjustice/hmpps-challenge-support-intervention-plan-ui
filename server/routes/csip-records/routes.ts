import { RequestHandler, Router } from 'express'
import { CsipRecordController } from './controller'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'

export const CsipRecordRoutes = (
  csipApiService: CsipApiService,
  prisonerSearchService: PrisonerSearchService,
): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const controller = new CsipRecordController(csipApiService, prisonerSearchService)

  get('/', controller.GET)

  return router
}
