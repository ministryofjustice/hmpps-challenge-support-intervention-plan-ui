import { RequestHandler, Router } from 'express'
import { InvolvementController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import type CsipApiService from '../../../services/csipApi/csipApiService'

export const InvolvementRoutes = (csipApiService: CsipApiService): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) =>
    router.post(path, validate(schemaFactory(csipApiService)), asyncMiddleware(handler))

  const referralOnBehalfOfController = new InvolvementController(csipApiService)

  get('/', referralOnBehalfOfController.GET)
  post('/', referralOnBehalfOfController.POST)

  return router
}
