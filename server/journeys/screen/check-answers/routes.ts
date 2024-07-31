import { RequestHandler, Router } from 'express'
import { ScreenCheckAnswersController } from './controller'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import type CsipApiService from '../../../services/csipApi/csipApiService'

export const ScreenCheckAnswersRoutes = (csipApiService: CsipApiService): Router => {
  const router = Router({ mergeParams: true })

  const controller = new ScreenCheckAnswersController(csipApiService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) =>
    router.post(path, controller.checkSubmitToAPI, asyncMiddleware(handler))

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
