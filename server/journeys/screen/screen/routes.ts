import { RequestHandler, Router } from 'express'
import { ScreenController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'

export const ScreenRoutes = (csipApiService: CsipApiService): Router => {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) =>
    router.post(path, validate(schemaFactory(csipApiService)), asyncMiddleware(handler))

  const controller = new ScreenController(csipApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
